import { useState, useDeferredValue, useMemo, useRef, useEffect } from 'react';
import { Cross1Icon, PlusIcon } from '@radix-ui/react-icons';
import * as Label from '@radix-ui/react-label';

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

export function Admin() {
  const [people, setPeople] = useState<Person[]>([]);
  const deferredPeople = useDeferredValue(people);
  const sortedPeople = useMemo(() => {
    const people = [...deferredPeople];
    people.sort((p1, p2) => {
      let v = p1.priority - p2.priority;
      if (v !== 0) return v;
      return p1.name.localeCompare(p2.name);
    });
    return people;
  }, [deferredPeople]);

  const ws = useRef<WebSocket>();
  useEffect(() => {
    ws.current = new WebSocket(`ws://${window.location.hostname}:8080`);

    ws.current.addEventListener('message', ({ data }) => {
      const message: ServerMessage = JSON.parse(data);

      if (message.type === 'init') {
        setPeople(message.people);
      } else if (message.type === 'add') {
        setPeople(people => [...people, message.person]);
      } else if (message.type === 'remove') {
        setPeople(people => people.filter(person => person.id !== message.id));
      }
    });

    return () => {
      ws.current!.close();
    };
  }, []);

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [priority, setPriority] = useState(0);

  return (
    <div className='bg-purple-200 p-5 flex flex-col items-center'>
      <div className='flex flex-row gap-5 items-center'>
        <div className='grid grid-cols-[2fr_4fr_1fr] gap-2 justify-items-center items-center'>
          <Label.Root htmlFor='name' className='text-purple-800'>
            Nome
          </Label.Root>
          <input
            className='bg-purple-500 rounded p-2 text-slate-200'
            type='text'
            id='name'
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
          <Label.Root htmlFor='position' className='text-purple-800'>
            Cargo
          </Label.Root>
          <input
            className='bg-purple-500 rounded p-2 text-slate-200'
            type='text'
            id='position'
            value={position}
            onChange={(event) => {
              setPosition(event.target.value);
            }}
          />
          <Label.Root htmlFor='priority' className='text-purple-800'>
            Prioridade
          </Label.Root>
          <input
            className='bg-purple-500 rounded p-2 text-slate-200'
            type='number'
            id='priority'
            value={priority}
            onChange={(event) => {
              setPriority(Number(event.target.value));
            }}
          />
          <button
            className='bg-purple-500 rounded p-2 text-slate-200 col-start-3 row-start-1 row-end-4'
            disabled={ws.current === undefined}
            onClick={() => {
              const message: ClientMessage = {
                type: 'add',
                person: {
                  name,
                  position,
                  priority,
                },
              };
              ws.current!.send(JSON.stringify(message));
            }}
          >
            <PlusIcon />
          </button>
        </div>
      </div>
      <div className='flex flex-col items-stretch p-5 gap-5 w-[32rem]'>
        {sortedPeople.map(person => (
          <div key={person.id} className='flex flex-row justify-between border-purple-800 border-2 p-5 rounded'>
            <div>
              <p className='text-2xl text-purple-800 font-bold'>{person.name}</p>
              <p className='text-lg text-purple-800 font-semibold'>{person.position}</p>
              <p className='text-sm text-purple-800'>Prioridade: {person.priority}</p>
            </div>
            <button
              className='text-purple-800'
              onClick={() => {
                const message: ClientMessage = {
                  type: 'remove',
                  id: person.id,
                };
                ws.current!.send(JSON.stringify(message));
              }}
              >
              <Cross1Icon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
