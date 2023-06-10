import createListComponent from './createListComponent';

const FixedSizeList = createListComponent({
  getEstimatedTotalSize: ({ itemSize, itemCount }) => itemSize * itemCount,
  getItemSize: ({ itemSize }, index) => itemSize,
  getItemOffset: ({ itemSize }, index) => itemSize * index,
  getStartIndexForOffset: ({ itemSize }, offset) => Math.floor(offset / itemSize),
  getStopIndexForStartIndex: ({ height, itemSize }, startIndex) => {
    const numVisibleItems = Math.ceil(height / itemSize);
    return startIndex + numVisibleItems - 1;
  }
})

export default FixedSizeList;
