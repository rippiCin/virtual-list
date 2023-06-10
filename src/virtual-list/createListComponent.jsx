import React from 'react';

class ListItem extends React.Component {
  constructor(props) {
    super(props);
    this.domRef = React.createRef();
    this.resizeObserver = null;
  }
  componentDidMount() {
    if (this.domRef.current) {
      const domNode = this.domRef.current.firstChild;
      const { index, onSizeChange } = this.props;
      this.resizeObserver = new ResizeObserver(() => {
        onSizeChange(index, domNode);
      });
      this.resizeObserver.observe(domNode);
    }
  }
  componentWillUnmount() {
    if (this.resizeObserver && this.domRef.current.firstChild) {
      this.resizeObserver.unobserve(this.domRef.current.firstChild);
    }
  }
  render() {
    const { index, style, ComponentType } = this.props;
    return (
      <div style={style} ref={this.domRef}>
        <ComponentType index={index} />
      </div>
    )
  }
}

const createListComponent = ({
  getEstimatedTotalSize,
  getItemSize,
  getItemOffset,
  getStartIndexForOffset, // 根据向上卷去的高度计算开始索引
  getStopIndexForStartIndex, // 根据开始索引和容器的高度计算结束索引
  initInstanceProps,
}) => {
  return class extends React.Component {
    instanceProps = initInstanceProps && initInstanceProps(this.props)
    static defaultProps = {
      overScanCount: 2,
    }
    state = { scrollOffset: 0 } // 向上卷去的高度
    // 缓存已加载过的项的样式
    itemStyleCache = new Map()

    onSizeChange = (index, domNode) => {
      const height = domNode.offsetHeight;
      const { itemMetaDataMap, lastMeasuredIndex } = this.instanceProps;
      const itemMetaData = itemMetaDataMap[index];
      itemMetaData.size = height;
      let offset = 0;
      for (let i = 0; i <= lastMeasuredIndex; i++) {
        const itemMetaData = itemMetaDataMap[i];
        itemMetaData.offset = offset;
        offset += itemMetaData.size;
      }
      this.itemStyleCache.clear();
      this.forceUpdate();
    }

    onScroll = (event) => {
      const { scrollTop } = event.currentTarget;
      this.setState({ scrollOffset: scrollTop });
    }
    getRangeToRender = () => {
      const { scrollOffset } = this.state;
      const { overScanCount, itemCount } = this.props;
      const startIndex = getStartIndexForOffset(this.props, scrollOffset, this.instanceProps);
      const stopIndex = getStopIndexForStartIndex(this.props, startIndex, scrollOffset, this.instanceProps);
      return [
        Math.max(0, startIndex - overScanCount),
        Math.min(itemCount - 1, stopIndex + overScanCount),
        startIndex,
        stopIndex,
      ];
    }
    getItemStyle = (index) => {
      let style;
      if (this.itemStyleCache.has(index)) {
        style = this.itemStyleCache.get(index);
      } else {
        style = {
          position: 'absolute',
          width: '100%',
          height: getItemSize(this.props, index, this.instanceProps),
          top: getItemOffset(this.props, index, this.instanceProps),
        }
        this.itemStyleCache.set(index, style);
      }
      return style;
    }

    render() {
      const { width, height, itemCount, children: Row, isDynamic } = this.props;
      const containerStyle = { position: 'relative', width, height, overflow: 'auto', willChange: 'transform' };
      const contentStyle = { width: '100%', height: getEstimatedTotalSize(this.props, this.instanceProps) };
      const items = [];
      if (itemCount > 0) {
        const [startIndex, stopIndex, originStartIndex, originStopIndex] = this.getRangeToRender();
        for (let index = startIndex; index <= stopIndex; index++) {
          if (isDynamic) {
            items.push(
              <ListItem key={index} index={index} style={this.getItemStyle(index)} ComponentType={Row} onSizeChange={this.onSizeChange} />
            );
          } else {
            if (index === originStartIndex) {
              items.push(
                <Row key={index} index={index} style={this.getItemStyle(index)} />
              );
            } else if (index === originStopIndex) {
              items.push(
                <Row key={index} index={index} style={this.getItemStyle(index)} />
              );
            } else {
              items.push(
                <Row key={index} index={index} style={this.getItemStyle(index)} />
              )
            }
          }
        }
      }
      return (
        <div style={containerStyle} onScroll={this.onScroll}>
          <div style={contentStyle}>
            {items}
          </div>
        </div>
      );
    }
  }

}

export default createListComponent;
