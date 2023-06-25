import React, { Component } from 'react';
import eventBus from './EventBus';
import './Card.css'

class CreateCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags || "",
      content: props.content || "",
    };
  }

  updateTags = (event) => {
    this.setState({tags: event.target.value});
  }

  updateContent = (event) => {
    this.setState({content: event.target.value});
  }

  create = (event) => {
    eventBus.dispatch('create', {tags: this.state.tags, content: this.state.content})
  }

  render() {
    return (
      <div className="card create-card" id={"edit-card-"+this.state.index}>
        <input
          className="tags-input"
          type="text"
          value={this.state.tags}
          placeholder="Tags"
          onChange={this.updateTags}
        />
        <textarea
          className="content-area"
          value={this.state.content}
          placeholder="Content"
          onChange={this.updateContent}
        />
        <div id="create-and-cancel-container">
          <button onClick={this.create}>Create</button>
          <button onClick={this.props.close}>Cancel</button>
        </div>
      </div>
    );
  }
}

export default CreateCard;
