import { useContext, useEffect } from 'react';
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

  useEffect(() => {
    subscribe(event, callback);
    return () => unsubscribe(event, callback);
  }, [event, callback, subscribe, unsubscribe]);
};

export default useSocket;

