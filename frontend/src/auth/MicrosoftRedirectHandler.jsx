import React, { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { AuthContext } from '../context/AuthContext';
import { loginRequest } from './msalConfig';
import api from '../api';
import { isProxyUser } from '../utils/authHelpers';

const MICROSOFT_LOGIN_PENDING_KEY = 'internsync_ms_login_pending';
const MICROSOFT_LOGIN_PROCESSING_KEY = 'internsync_ms_login_processing';

const MicrosoftRedirectHandler = () => {
  const { instance, accounts, inProgress } = useMsal();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const handledRef = useRef(false);

  const hasRole = (roles = [], roleName) => {
    return roles.some((r) => r === roleName || r?.authority === roleName);
  };

  const navigateAfterLogin = (data) => {
    const roles = data.roles || [];

    if (hasRole(roles, 'ROLE_ADMIN') || data.role === 'ADMIN') {
      navigate('/');
      return;
    }

    if (hasRole(roles, 'ROLE_EMPLOYEE') || data.role === 'EMPLOYEE') {
      const designation = data.designation;
      const isProxy = isProxyUser(data);

      if (isProxy) {
        navigate('/proxy-dashboard');
      } else if (designation === 'General Manager') {
        navigate('/gm-dashboard');
      } else if (designation === 'Deputy General Manager') {
        navigate('/dgm-dashboard');
      } else {
        navigate('/employee-dashboard');
      }

      return;
    }

    navigate('/intern-dashboard');
  };

  useEffect(() => {
    const completeMicrosoftLogin = async () => {
      const pending =
        sessionStorage.getItem(MICROSOFT_LOGIN_PENDING_KEY) === 'true';

      if (!pending) return;
      if (handledRef.current) return;
      if (inProgress !== InteractionStatus.None) return;

      handledRef.current = true;
      sessionStorage.setItem(MICROSOFT_LOGIN_PROCESSING_KEY, 'true');

      try {
        console.log('Completing Microsoft login after redirect...');

        const account =
          instance.getActiveAccount() ||
          accounts[0] ||
          instance.getAllAccounts()[0];

        if (!account) {
          throw new Error('Microsoft account was not found after redirect.');
        }

        instance.setActiveAccount(account);

        const tokenResult = await instance.acquireTokenSilent({
          ...loginRequest,
          account,
        });

        console.log('MSAL silent token result:', tokenResult);
        console.log('ID token exists:', !!tokenResult.idToken);

        if (!tokenResult.idToken) {
          throw new Error('Microsoft did not return an ID token.');
        }

        const response = await api.post('/auth/microsoft', {
          idToken: tokenResult.idToken,
        });

        console.log('Backend Microsoft login response:', response.data);

        sessionStorage.removeItem(MICROSOFT_LOGIN_PENDING_KEY);
        sessionStorage.removeItem(MICROSOFT_LOGIN_PROCESSING_KEY);

        login(response.data.token, response.data);
        navigateAfterLogin(response.data);
      } catch (err) {
        console.error('Failed to complete Microsoft login:', err);

        sessionStorage.removeItem(MICROSOFT_LOGIN_PENDING_KEY);
        sessionStorage.removeItem(MICROSOFT_LOGIN_PROCESSING_KEY);

        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Microsoft login failed.';

        alert('Microsoft login failed: ' + message);
      } finally {
        handledRef.current = false;
      }
    };

    completeMicrosoftLogin();
  }, [instance, accounts, inProgress]);

  return null;
};

export default MicrosoftRedirectHandler;
