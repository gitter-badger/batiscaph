
generate_traces:
	./rebar3 compile
	erl -pa `./rebar3 path` -noshell -eval 'etg:trace_repl_scenarios(["learn-you-some-erlang"])' -eval 'init:stop()'