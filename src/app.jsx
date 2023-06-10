import React from 'react';
import { VariableSizeList } from './virtual-list'
import './app.less';

const items = [];
const itemCount = 1000;
for (let i = 0; i < itemCount; i++) {
  const height = (30 + Math.floor(Math.random() * 30));
  const style = {
    height,
    width: '100%',
  }
  items.push(
    <div className={i % 2 ? 'list-item-odd' : 'list-item-even'} style={style}>Row {i}</div>
  )
}

const Row = ({ index }) => items[index];

const App = () => {
  return (
    <VariableSizeList
      className="list"
      height={200}
      width={200}
      itemCount={itemCount}
      isDynamic
    >
      {Row}
    </VariableSizeList>
  );
}

export default App;
