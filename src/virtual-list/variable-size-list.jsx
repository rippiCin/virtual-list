import createListComponent from './createListComponent';
// 预测每一项的高度默认为50（若用户不传的话）
const DEFAULT_ESTIMATED_SIZE = 50;
const getEstimatedTotalSize = ({ itemCount }, { estimatedItemSize, lastMeasuredIndex, itemMetaDataMap }) => {
  // 已经记录的项的高度之和，也就是最后一项的offset+它的高
  let totalSizeOfMeasuredItems = 0;
  if (lastMeasuredIndex >= 0) {
    const itemMetaData = itemMetaDataMap[lastMeasuredIndex];
    totalSizeOfMeasuredItems = itemMetaData.offset + itemMetaData.size;
  }
  // 未测量过的条目的数量，初始为总条数
  const numUnMeasuerdItems = itemCount - lastMeasuredIndex - 1;
  // 预测的总高度，预测高度是为了撑开盒子，让它能滚动，触发滚动事件
  const totalSizeOfUnMeasuredItems = totalSizeOfMeasuredItems + numUnMeasuerdItems * estimatedItemSize;
  return totalSizeOfUnMeasuredItems;
}
const findNearestItem = (props, offset, instanceProps) => {
  const { lastMeasuredIndex, itemMetaDataMap } = instanceProps;
  // 此处可以用二分法优化
  // for (let i = 0; i <= lastMeasuredIndex; i++) {
  //     const currentOffset = getItemMetaData(props, i, instanceProps).offset;
  //     if (currentOffset >= offset) {
  //         return i;
  //     }
  // }
  let lastMeasuredItemOffset = lastMeasuredIndex > 0 ? itemMetaDataMap[lastMeasuredIndex].offset : 0;
  if (lastMeasuredItemOffset >= offset) {
    return findNearestItemBinarySearch(props, instanceProps, lastMeasuredIndex, 0, offset);
  } else {
    return findNearestExponentialSearch(props, instanceProps, Math.max(0, lastMeasuredIndex), offset);
  }
}
const findNearestItemBinarySearch = (props, instanceProps, high, low, offset) => {
  while (low <= high) {
    const middle = low + Math.floor((high - low) / 2);
    const currentOffset = getItemMetaData(props, middle, instanceProps).offset;
    if (currentOffset === offset) {
      return middle;
    } else if (currentOffset < offset) {
      low = middle + 1;
    } else if (currentOffset > offset) {
      high = middle - 1;
    }
  }
  if (low > 0) {
    return low - 1;
  } else {
    return 0;
  }
}
const findNearestExponentialSearch = (props, instanceProps, index, offset) => {
  const { itemCount } = props;
  let interval = 1;
  // 指数性查找到那项的offset比当前offset要大的项
  while (index < itemCount && getItemMetaData(props, index, instanceProps).offset < offset) {
    index += interval;
    interval *= 2;
  }
  return findNearestItemBinarySearch(props, instanceProps, Math.min(index, itemCount - 1), Math.floor(index / 2), offset);
}
// 获取每项对应的数据
const getItemMetaData = (props, index, instanceProps) => {
  const { itemSize } = props;
  const { itemMetaDataMap, lastMeasuredIndex } = instanceProps;
  // 如果当前索引大于上一次已记录信息的项的索引，说明此项还未被记录，需要算他的offset和size
  if (index > lastMeasuredIndex) {
    // 计算上一次已记录的项的下一项的offset的值
    let offset = 0;
    if (lastMeasuredIndex >= 0) {
      const itemMetaData = itemMetaDataMap[lastMeasuredIndex];
      // 这一项的offset等于上一项的offset + 它的高度
      offset = itemMetaData.offset + itemMetaData.size;
    }
    for (let i = lastMeasuredIndex + 1; i <= index; i++) {
      let size = itemSize ? itemSize(i) : DEFAULT_ESTIMATED_SIZE;
      // 将计算出来的信息记录下
      itemMetaDataMap[i] = { size, offset };
      // 下一项的offset为此项的offset + 此项的高
      offset += size;
    }
    // 更新已被记录信息的项的索引
    instanceProps.lastMeasuredIndex = index;
  }
  return itemMetaDataMap[index];
}
const VariableSizeList = createListComponent({
  getEstimatedTotalSize,
  getItemSize: (props, index, instanceProps) => getItemMetaData(props, index, instanceProps).size,
  getItemOffset: (props, index, instanceProps) => getItemMetaData(props, index, instanceProps).offset,
  getStartIndexForOffset: findNearestItem,
  getStopIndexForStartIndex: (props, startIndex, scrollOffset, instanceProps) => {
    const { height, itemCount } = props;
    // 获取开始项的数据
    const itemMetaData = getItemMetaData(props, startIndex, instanceProps);
    // 开始索引项的offset + 可视区的高，就是最大的offset值
    let maxOffset = itemMetaData.offset + height;
    // 开始项下一项的offset值
    let offset = itemMetaData.offset + itemMetaData.size;
    let stopIndex = startIndex;
    // 首个项的offset + 自身高度（即下一项的offset）触碰到或者超过最大offset的索引，就是结束索引
    while (stopIndex < itemCount - 1 && offset < maxOffset) {
      stopIndex++;
      // 每一次索引加1，offset加上每项的高度
      offset += getItemMetaData(props, stopIndex, instanceProps).size;
    }
    return stopIndex;
  },
  initInstanceProps: (props) => {
    const { estimatedItemSize } = props;
    const instanceProps = {
      estimatedItemSize: estimatedItemSize || DEFAULT_ESTIMATED_SIZE,
      // 记录每项的信息，size是每项真实高度，offset是每项真实top值
      itemMetaDataMap: {},
      // 已经被记录真实信息的项的索引
      lastMeasuredIndex: -1,
    }
    return instanceProps;
  }
})

export default VariableSizeList;
