import requests
import json

def test_registration():
    url = 'http://127.0.0.1:8000/api/usuarios/'
    payload = {
        "nome": "Teste Automatizado",
        "email": "auto_test@email.com",
        "senha": "password123",
        "tipo_perfil": "doador"
    }
    headers = {'Content-Type': 'application/json'}
    
    print(f"Enviando requisição para {url}...")
    try:
        
        response_get = requests.get(url, timeout=5)
        print(f"Status do GET: {response_get.status_code}")
        
       
        response = requests.post(url, data=json.dumps(payload), headers=headers, timeout=5)
        print(f"Status do POST: {response.status_code}")
        print(f"Resposta: {response.text}")
        
        if response.status_code == 201:
            print("\nSUCESSO: O backend aceitou o registro!")
        elif response.status_code == 400 and 'email' in response.text:
            print("\nINFO: O usuário já existe, o que significa que o backend está funcionando.")
        else:
            print(f"\nERRO: O backend retornou status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("\nERRO DE CONEXÃO: O servidor Django não parece estar rodando em http://127.0.0.1:8000")
    except Exception as e:
        print(f"\nERRO INESPERADO: {str(e)}")

if __name__ == "__main__":
    test_registration()
