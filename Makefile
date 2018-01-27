CLICKHOUSE_DB = batiscaph
CLICKHOUSE_TEST_DB = batiscaph_test
CLICKHOUSE_URL = http://0.0.0.0:8123/
NEO4J_HTTP_URL = http://neo4j:neo4j@0.0.0.0:7474/
HTTP_PORT = 8099
BATISCAPH_NODE = batiscaph@$(shell hostname)

shell:
	BATISCAPH_CLICKHOUSE_DB=$(CLICKHOUSE_DB) BATISCAPH_CLICKHOUSE_URL=$(CLICKHOUSE_URL) BATISCAPH_NEO4J_HTTP_URL=$(NEO4J_HTTP_URL) BATISCAPH_HTTP_PORT=$(HTTP_PORT) ./rebar3 shell --sname batiscaph --apps batiscaph

ct:
	BATISCAPH_CLICKHOUSE_DB=$(CLICKHOUSE_TEST_DB) BATISCAPH_CLICKHOUSE_URL=$(CLICKHOUSE_URL) BATISCAPH_NEO4J_HTTP_URL=$(NEO4J_HTTP_URL) BATISCAPH_NODE=$(BATISCAPH_NODE) ./rebar3 ct --sname ct_run # --suite shell_SUITE
