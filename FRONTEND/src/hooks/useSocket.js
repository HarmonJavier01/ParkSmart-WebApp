import { useContext, useEffect, useRef } from 'react';
import { SocketContext } from '../context/SocketContext.jsx';

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const useSocketEvent = (event, callback) => {
  const { subscribe, unsubscribe } = useSocket();
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (...args) => {
      if (savedCallback.current) {
        savedCallback.current(...args);
      }
    };
    subscribe(event, handler);
    return () => unsubscribe(event, handler);
  }, [event, subscribe, unsubscribe]);
};

export default useSocket;

