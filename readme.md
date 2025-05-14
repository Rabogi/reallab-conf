Python 3.9+

1)Установка зависимостей:

python3 -m pip install -r requirements.txt

2)Генерация SSL:

openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 \
    -subj "/C=RU/ST=Rostovkya oblast/L=Taganrog/O=Reallab/CN=localhost" \
    -keyout key.pem  -out cert.pem

3)Полученые файлы перенести в папку новую папку SSL:

mkdir ssl

mv *.pem ./ssl

4)Изменить файл сервиса reallab.service:

1) На 6 строке указать полный до app.py
2) На 7 строке указать полный путь до рабочей папки
3) на 9 строке указать пользователя от имени которого будет работать программа. Пользователь должен иметь sudo доступ.

5)Скопировать файл сервиса в папку /etc/systemd/system/

sudo cp reallab.service /etc/systemd/system/

6)Перезагрузить systemd

sudo systemctl daemon-reload

7)Запуск сервера

sudo systemctl enable reallab.service

sudo systemctl start reallab.service

8)Сервер будет запущен на 8000 порту и доступен для всех в локальной сети. При доступе к сайту браузер будет ругаться что сертификат недействителен. Необходимо проигнорировать это предупреждение.

9)По умолчанию логин admin пароль 123.

