import React from 'react';
import './ContextMenu.css';
import 'font-awesome/css/font-awesome.css';

export default class ContextMenu extends React.Component {

  menuItems() {
    return [];
  }

  render() {
    return (
      <div className="menu">
        {this.menuItems().map(item => {
          if (item.canRender()) {
            return item.render();
          }
          return null;
        })}
      </div>
    );
  }
}