.PHONY: default
default: install update;

# Use forward slash in Linux and double backward slash on Windows.
ifdef ComSpec
    PATHSEP2=\\
else
    PATHSEP2=/
endif
PATHSEP=$(strip $(PATHSEP2))

install:
	pip3 install -r requirements.txt --user
	yarn

update:
	./scripts/fetch_raw_data.py
	./scripts/export.py

clear:
	rm tmp/*

ci: update
	git add static/domains.json
	git commit -m'CI updates data'
	git push
	yarn deploy
