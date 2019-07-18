# build docker image
Build the image with multi-stage
```bash
docker build -t aduyng/home-automation-dashboard:latest .
```

Run the ngnix image
```bash
docker run -p 8080:80 aduyng/home-automation-dashboard:latest
```

# steps to deploy to raspberry pi
1. build the app
    ```bash
    npm run build
    ```
1. copy to the target raspberry pi
    ```bash
    scp -r build pi@192.168.86.7:/home/pi/Downloads/
    ```
1. ssh into pi and move the file to document root of nginx
    ```bash
    ssh pi@192.168.86.7
    sudo cp -r /home/pi/Downloads/build/* /var/www/html
    ```
1. reboot the pi
    ```bash
    sudo reboot
    ```