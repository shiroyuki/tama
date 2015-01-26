PYI=python
SERVICE_FLAG=
GO_PATH=go
SCSS_PATH=static/scss
CSS_PATH=static/css

compile: gocode css
	@echo "Done"

clean: clean_gocode clean_css
	@echo "Done"

gocode:
	@cd $(GO_PATH) && go build main.go

clean_gocode:
	@cd $(GO_PATH) && rm -v main

service: css
	@$(PYI) server.py $(SERVICE_FLAG)

css:
	@sass --update $(SCSS_PATH):$(CSS_PATH) --style compressed

css_live:
	@sass --watch $(SCSS_PATH):$(CSS_PATH) --style compressed

clean_css:
	@rm -v $(CSS_PATH)/*