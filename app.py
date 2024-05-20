from flask import Flask, request, render_template, Response
import requests
import logging
import json

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/query', methods=['GET'])
def query_model():
    prompt = request.args.get('prompt', '')

    if not prompt:
        return Response("data: Error: Prompt is required\n\n", mimetype='text/event-stream')

    def stream_response():
        try:
            response = requests.post(
                'http://localhost:11434/api/generate',
                headers={'Content-Type': 'application/json'},
                json={'model': 'phi3', 'prompt': prompt},
                stream=True
            )

            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        json_line = json.loads(line)
                        yield f"data: {json_line['response']}\n\n"
                yield "event: end\ndata: end\n\n"
            else:
                yield f"data: Error: Failed to get response from model\n\n"
        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"

    return Response(stream_response(), mimetype='text/event-stream')


if __name__ == '__main__':
    app.run(debug=True)
