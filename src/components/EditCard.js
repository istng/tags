import React, { Component } from 'react';
import eventBus from './EventBus';
import './Card.css'

class EditCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags || "",
      content: props.content || "",
      index: props.index || 0,
    };
  }

  componentDidMount() {
    eventBus.on('edit', (data) => {
      this.setState({
        tags: data.tags,
        content: data.content,
        index: data.index,
      });
    });
  }

  updateTags = (event) => {
    this.setState({tags: event.target.value});
  }

  updateContent = (event) => {
    this.setState({content: event.target.value});
  }

  save = (event) => {
    eventBus.dispatch('save', {index: this.state.index, tags: this.state.tags, content: this.state.content})
  }

  render() {
    return (
      <div className="card edit-card" id={"edit-card-"+this.state.index}>
        <input
          className="tags-input"
          type="text"
          value={this.state.tags}
          onChange={this.updateTags}
        />
        <textarea
          className="content-area"
          value={this.state.content}
          onChange={this.updateContent}
        />
        <div id="save-and-cancel-container">
          <button onClick={this.save}>Save</button>
          <button onClick={this.props.close}>Cancel</button>
        </div>
      </div>
    );
  }
}

export default EditCard;
