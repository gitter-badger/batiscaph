let shortPrompt = function (prompt) {
  return /(\d+>)/.exec(prompt)[0];
}



class ShellPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      viewportHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
      text: ""
    }

    // because new EcmaScript standard is poorly designed
    // we have to do bindings like that
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
  }

  onTextChange(e) {
    let text = e.target.value;
    this.setState({text: text});
  }

  onKeyPress(e) {
    // plain Enter makes new line
    // Shift + Enter sends input to remote shell
    if (e.key === 'Enter' && e.shiftKey && this.state.text) {
      console.log("---\nshell input: ", this.state.text);
      this.submitInput()
    }
  }

  submitInput() {
    this.props.submitInput(this.state.text);
    this.setState({text: ""});
  }

  renderInputItem(e) {
    return <div key={e.at} className="item input">
      <code className="prompt unselectable">{shortPrompt(e.prompt)}</code>
      <code className="message">{e.message}</code>
    </div>;
  }

  renderOutputItem(e) {
    return <div key={e.at} className="item output">
      <code className="prompt unselectable"></code>
      <code className="message">{e.message}</code>
    </div>;
  }

  renderEvents() {
    let items = [];
    for (var i in this.props.events) {
      let e = this.props.events[i];
      if (e.type == 'shell_input') {
        items.push(this.renderInputItem(e));
      } else if (e.type == 'shell_output') {
        items.push(this.renderOutputItem(e));
      }
    }
    return items;
  }

  renderPrompt() {
    if (this.props.prompt) {
      return <div>
        <div className="item active underline">
          <code className="prompt unselectable">{shortPrompt(this.props.prompt)}</code>
          <textarea value={this.state.text} rows={3} onChange={this.onTextChange.bind(this)} onKeyPress={this.onKeyPress.bind(this)} />
        </div>
      </div>;
    }
  }

  render() {
    let maxHeight = this.state.viewportHeight - 40;

    return <div style={{width: this.props.width, maxHeight: maxHeight}} className="ShellPanel">
      {this.renderEvents()}
      {this.renderPrompt()}
    </div>
  }
}