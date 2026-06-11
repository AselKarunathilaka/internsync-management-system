import api from '../../../api';

export const getProxyConfig = async () => {
    const response = await api.get('/proxy/config');
    return response.data;
};

export const getMyProxyAccess = async () => {
    const response = await api.get('/proxy/me');
    return response.data;
};

export const checkProxyPermission = async (permission, scopeType, scopeValue) => {
    const response = await api.post('/proxy/check', { permission, scopeType, scopeValue });
    return response.data;
};

export const getProxyAssignments = async (scopeType, scopeValue) => {
    const params = new URLSearchParams();
    if (scopeType) params.append('scopeType', scopeType);
    if (scopeValue) params.append('scopeValue', scopeValue);
    
    const response = await api.get(`/proxy/assignments?${params.toString()}`);
    return response.data;
};

export const assignProxy = async (data) => {
    const response = await api.post('/proxy/assignments', data);
    return response.data;
};

export const bulkAssignProxy = async (data) => {
    const response = await api.post('/proxy/assignments/bulk', data);
    return response.data;
};

export const updateProxyPermissions = async (id, data) => {
    const response = await api.patch(`/proxy/assignments/${id}/permissions`, data);
    return response.data;
};

export const disableProxy = async (id, reason) => {
    const response = await api.patch(`/proxy/assignments/${id}/disable`, { reason });
    return response.data;
};

export const enableProxy = async (id, reason) => {
    const response = await api.patch(`/proxy/assignments/${id}/enable`, { reason });
    return response.data;
};

export const removeProxy = async (id, reason) => {
    const response = await api.patch(`/proxy/assignments/${id}/remove`, { reason });
    return response.data;
};

export const getProxyLogs = async (scopeValue) => {
    const params = scopeValue ? `?scopeValue=${encodeURIComponent(scopeValue)}` : '';
    const response = await api.get(`/proxy/logs${params}`);
    return response.data;
};
