import React, { Component } from 'react';
import './App.css';
import Card from './components/Card';
import EditCard from './components/EditCard';
import CreateCard from './components/CreateCard';
import eventBus from './components/EventBus';
import data from './data.json';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: data
    };
    this.editCardContainer = React.createRef();
    this.createCardContainer = React.createRef();
  }

  componentDidMount() {
    eventBus.on('edit', (data) => {
      this.editCardContainer.current.style.visibility = "visible";
      this.editCardContainer.current.style.opacity = "1";
    });
    eventBus.on('save', (data) => {
      this.closeEdit();
    });
    eventBus.on('create', (data) => {
      this.closeCreate();
      this.setState(prevState => ({
        cards: [...prevState.cards,
          {
            tags: data.tags.split(","),
            content: data.content,
          }
        ]
      }));
    });
  }
  
  searchTags = (event) => {
    const value = event.target.value;
    if (event.key === 'Enter' && value !== "") {
      eventBus.dispatch('search', {tags: value.split(",")})
    }
  };

  showAll = (event) => {
    if(event.target.value === "")
      eventBus.dispatch('showall', {tags: []})
  };

  closeEdit = () => {
    this.editCardContainer.current.style.visibility = "hidden";
  };

  newCard = () => {
    this.createCardContainer.current.style.visibility = "visible";
    this.createCardContainer.current.style.opacity = "1";
  };
  closeCreate = () => {
    this.createCardContainer.current.style.visibility = "hidden";
  };

  render() {
    return (
      <div className="App">
        <div id="cards-tower">
          <div id="search-and-new-container">
            <input
              type="text"
              onKeyDown={this.searchTags}
              onChange={this.showAll}
            />
            <button onClick={this.newCard}>New</button>
          </div>
          <div id="cards-container">
            {this.state.cards.map((card, index) => {
              return <Card
                key={index}
                tags={card.tags}
                content={card.content}
                index={index}
              />
            })}
          </div>
        </div>
        <div id="edit-card-container" ref={this.editCardContainer}>
          <EditCard close={this.closeEdit} />
        </div>
        <div id="new-card-container" ref={this.createCardContainer}>
          <CreateCard close={this.closeCreate} />
        </div>
      </div>
    );
  }
}

export default App;
