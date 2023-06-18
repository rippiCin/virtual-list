// import FixedSizeList from './fixed-size-list-custom';
import React from 'react';
import { FixedSizeList } from './virtual-list'
import './app.less';

const Row = ({ index, style, forwardRef }) => {
    return (
        <div className={index % 2 ? 'list-item-odd' : 'list-item-even'} style={style} ref={forwardRef}>
            Row {index}
        </div>
    )
}

const App = () => {
    return (
        <FixedSizeList
          className="list"
          height={200}
          width={200}
          itemSize={50}
          itemCount={100000}
        >
            {Row}
        </FixedSizeList>
    );
}

export default App;
