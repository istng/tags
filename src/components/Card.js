import React, { Component } from 'react';
import eventBus from './EventBus';
import './Card.css';

class Card extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags,
      content: props.content,
      index: props.index,
    };
  }

  componentDidMount() {
    eventBus.on('search', (data) => {
      if(!data.tags.every((tag) => this.state.tags.includes(tag)))
        this.hide();
      else
        this.show();
    });
    eventBus.on('showall', () => {
      this.show();
    });
    eventBus.on('save', (data) => {
      if(data.index === this.state.index) {
        this.setState({
          tags: data.tags,
          content: data.content,
        });
      }
    });
  }

  hide = () => {
    document.getElementById("card-"+this.state.index).style.display = "none";
  }

  show = () => {
    document.getElementById("card-"+this.state.index).style.display = "block";
  }

  edit = (event) => {
    eventBus.dispatch('edit', {index: this.state.index, tags: this.state.tags, content: this.state.content})
  }

  render() {
    return (
      <div className="card" id={"card-"+this.state.index}>
        <div id="tags-and-edit-container">
          <input
            className="tags-input"
            type="text"
            value={this.state.tags}
            readOnly
          />
          <button onClick={this.edit}>Edit</button>
        </div>
        <textarea
          className="content-area"
          value={this.state.content}
          readOnly
        />
      </div>
    );
  }
}

export default Card;
