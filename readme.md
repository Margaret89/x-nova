# Установка

В пустую папку

```sh
git clone https://git.alma-com.ru/alma/vite-tmpl.git .
yarn
npm i
```

# Использование

### Разработка

```sh
yarn dev
npm run dev
```

### Сборка в /dist/

```sh
yarn build
npm run build
```

### Сборка в другую папку

Используется в локальных проектах на битрикс

1. Создать файл `.env.bitrix.local` с содержимым

	```env
	OUTDIR='../<SITE_DIRECTORY>/local/templates/<TEMPLATE_NAME>'
	```
	где `<SITE_DIRECTORY>` - папка сайта, `<TEMPLATE_NAME>`


2. Запустить команду

	```sh
	yarn bitrix
	npm run bitrix
	```

3. Перенести папку `<TEMPLATE_NAME>/upload/` в корень проекта
4. Удалить (опционально) папку `<TEMPLATE_NAME>/pages/`


### Сборка как статический сайт

1. Запустить 
	```sh
	yarn static
	npm run static
	```
2. Перенести на сарвер содержимое `dist`
3. Перенести файлы из `pages` в корень