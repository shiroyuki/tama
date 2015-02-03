PYI=python
PY_VER=3
SERVICE_FLAG=
GO_PATH=go
PY_FPATH=../cpython/Tools/freeze/freeze.py
SCSS_PATH=static/scss
CSS_PATH=static/css

compile: css #gocode
	@./compile $(PY_VER) $(PY_FPATH)
	@echo "Done"

clean: clean_gocode clean_css
	@echo "Done"

gocode:
	@cd $(GO_PATH) && go build main.go

clean_gocode:
	@cd $(GO_PATH) && rm -v main

service: css
	@$(PYI)$(PY_VER) server.py $(SERVICE_FLAG)

css:
	@sass --update $(SCSS_PATH):$(CSS_PATH) --style compressed

css_live:
	@sass --watch $(SCSS_PATH):$(CSS_PATH) --style compressed

clean_css:
	@rm -v $(CSS_PATH)/*