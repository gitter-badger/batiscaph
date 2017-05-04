-module(etg_shell_runner).
-behaviour(gen_server).
-export([start_link/0]).
-export([init/1, handle_call/3, handle_cast/2, handle_info/2, terminate/2, code_change/3]).

-record(shell_runner, {
  shell_pid
}).



code_change(_, State, _) -> {ok, State}.
terminate(_,_State) -> ok.

start_link() ->
  gen_server:start_link(?MODULE, [], []).

init([]) ->
  {ok, #shell_runner{}}.



handle_info(start_shell, State) ->
  Pid = shell:start(false, true),
  {noreply, State#shell_runner{shell_pid=Pid}};

handle_info(Msg, State) ->
  {stop, {unknown_info, Msg}, State}.

handle_call(Call, _From, State) ->
  {stop, {unknown_call, Call}, State}.

handle_cast(Cast, State) ->
  {stop, {unknown_cast, Cast}, State}.
