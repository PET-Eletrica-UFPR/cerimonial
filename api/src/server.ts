import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

interface Person {
  id: number;
  name: string;
  position: string;
  priority: number;
}

type ServerMessage = {
  type: 'init';
  people: Person[];
} | {
  type: 'add';
  person: Person;
} | {
  type: 'remove';
  id: number;
};

type ClientMessage = {
  type: 'add';
  person: Omit<Person, 'id'>;
} | {
  type: 'remove';
  id: number;
};

const people: Map<number, Omit<Person, 'id'>> = new Map();
let nextId = 0;

wss.on('connection', (ws) => {
  const message: ServerMessage = {
    type: 'init',
    people: Array.from(people, ([id, person]) => ({ id, ...person })),
  };
  ws.send(JSON.stringify(message));

  ws.on('message', (data) => {
    const receivedMessage: ClientMessage = JSON.parse(data.toString());

    if (receivedMessage.type === 'add') {
      const id = nextId++;
      people.set(id, receivedMessage.person);

      const message: ServerMessage = {
        type: 'add',
        person: {
          id,
          ...receivedMessage.person,
        },
      };
      for (const client of wss.clients) {
        client.send(JSON.stringify(message));
      }
    } else if (receivedMessage.type === 'remove') {
      people.delete(receivedMessage.id);

      const message: ServerMessage = {
        type: 'remove',
        id: receivedMessage.id,
      };
      for (const client of wss.clients) {
        client.send(JSON.stringify(message));
      }
    }
  });
});
