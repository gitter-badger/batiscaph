const Route = ReactRouterDOM.Route;
const Redirect = ReactRouterDOM.Redirect;
const Switch = ReactRouterDOM.Switch;



class App extends React.Component {
  constructor() {
    super();
    this.state = {
      tree: undefined,
      shellPrompt: undefined,
      shellEvents: [],
      selectedContext: null
    };
    this._layout = {};

    // because new EcmaScript standard is poorly designed
    // we have to do bindings like that
    this.startNewShell = this.startNewShell.bind(this);
    this.connectToNode = this.connectToNode.bind(this);
    this.onInstanceRoute = this.onInstanceRoute.bind(this);
    this.onWSMessage = this.onWSMessage.bind(this);
    this.submitShellInput = this.submitShellInput.bind(this);
    this.tracePid = this.tracePid.bind(this);
    this.selectContext = this.selectContext.bind(this);
  }

  onInstanceRoute(id, context) {
    if (!id) {
      // just closed scenario, close websocket
      if (V.socket) {
        V.socket.close();
        V.socket = null;
        return;
      }
    }

    // must be freshly created shell, do nothing
    if (V.socket) { return; }

    this._layout = {};
    this.setState({tree: undefined, shellPrompt: undefined, shellEvents: [], selectedContext: null});

    this.connectToExistingShell(id, context);
  }

  onWSMessage(event) {
    if (event.data.indexOf("shell_connected ") == 0) {
      let id = event.data.slice("shell_connected ".length);
      this.props.history.push("/scenarios/" + id)
    } else if (event.data.indexOf("delta ") == 0) {
      let delta = JSON.parse(event.data.slice("delta ".length));
      console.log("delta", delta);
      this.applyDeltaSetState(delta);
    } else if (event.data.indexOf('shell_input_ready ') == 0) {
      let prompt = event.data.split(' ')[1];
      this.updateShellReady(prompt);
    } else if (event.data == 'shell_input_stopped') {
      this.updateShellReady(null);
    }
  }

  updateShellReady(prompt) {
    this.setState({shellPrompt: prompt});
  }

  produceShellEvents(delta) {
    let events = this.state.shellEvents.slice();
    for (let i in delta.events) {
      let e = delta.events[i];
      if (e.type == 'shell_input_expected') {
      } else if (e.type == 'shell_input') {
        events.push(e);
      } else if (e.type == 'shell_output') {
        events.push(e);
      }
    }
    return events;
  }

  applyDeltaSetState(delta) {
    V.updateLayout(delta, this._layout);
    let tree = V.produceTree(this._layout);
    let shellEvents = this.produceShellEvents(delta);
    console.log("layout", this._layout);
    console.log("tree", tree);
    console.log("shellEvents", shellEvents);
    this.setState({tree: tree, shellEvents: shellEvents});
  }

  startNewShell() {
    if (V.socket) { console.error("Unexpected opened socket"); return; }
    this.setState({tree: undefined, shellPrompt: undefined, shellEvents: [], selectedContext: null});

    V.socket = new WebSocket("ws://"+window.location.host+"/websocket");
    V.socket.addEventListener('message', this.onWSMessage);
    V.socket.addEventListener('open', (function () {
      V.socket.send('start_shell');
    }).bind(this));
  }

  connectToNode(node) {
    if (V.socket) { console.error("Unexpected opened socket"); return; }
    this.setState({tree: undefined, shellPrompt: undefined, shellEvents: [], selectedContext: null});

    V.socket = new WebSocket("ws://"+window.location.host+"/websocket");
    V.socket.addEventListener('message', this.onWSMessage);
    V.socket.addEventListener('open', (function () {
      V.socket.send('start_shell_on_node ' + node);
    }).bind(this));
  }

  connectToExistingShell(id, context) {
    V.socket = new WebSocket("ws://"+window.location.host+"/websocket");
    V.socket.addEventListener('message', this.onWSMessage);
    let cmd = 'connect_to_shell ' + id;
    if (context) {
      cmd += " " + context;
    }
    V.socket.addEventListener('open', (function () {
      V.socket.send(cmd);
    }).bind(this));
  }

  submitShellInput(text) {
    V.socket.send('shell_input ' + text + "\n");
  }

  tracePid(pid) {
    if (!pid) { console.error("Got request to trace invalid pid:", pid); return; }
    V.socket.send('trace_pid ' + pid);
  }

  selectContext(key) {
    this.setState({selectedContext: key});
  }

  render() {
    return <div>
      <Switch>
        <Route exact path="/scenarios/:id/:context*" render={(props) =>
          <ScenarioView tree={this.state.tree} shellPrompt={this.state.shellPrompt} shellEvents={this.state.shellEvents}
          submitShellInput={this.submitShellInput} onInstanceRoute={this.onInstanceRoute}
          tracePid={this.tracePid} selectContext={this.selectContext}
          selectedContext={this.state.selectedContext}
          {...props} />
        } />

        <Route exact path="/" render={(props) =>
          <MainPage startNewShell={this.startNewShell} connectToNode={this.connectToNode} />
        } />

      </Switch>
    </div>;
  }
};
