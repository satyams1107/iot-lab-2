import socket
from motor import Ordinary_Car
import time

HOST = "192.168.1.55"
PORT = 65432
car = Ordinary_Car()

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen()
    print(f"Listening on {HOST}:{PORT}")

    try:
        client, clientInfo = s.accept()
        print("Connected to:", clientInfo)
        with client:
            while True:
                data = client.recv(1024)
                if not data:
                    print("Client disconnected")
                    break

                command = data.decode().strip()
                print(f"Received: {command}")

                if command == "up":
                    car.set_motor_model(-1000, -1000, -1000, -1000)
                    time.sleep(1)
                    
                elif command == "right":
                    car.set_motor_model(-2000, -2000, 2000, 2000)
                    time.sleep(2)
                elif command == "left":
                    car.set_motor_model(2000, 2000, -2000, -2000)
                    time.sleep(2)
                elif command == "down":
                    car.set_motor_model(1000, 1000, 1000, 1000)
                    time.sleep(1)
                else:
                    print("Unknown command:", command)
                
                car.set_motor_model(0, 0, 0, 0)

                client.sendall(command.encode())

    except Exception as e:
        print("Error:", e)
    finally:
        print("Closing socket")
        car.set_motor_model(0, 0, 0, 0)
        s.close()
