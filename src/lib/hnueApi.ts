/**
 * HNUE API Service Layer
 * Chứa toàn bộ logic kết nối với máy chủ trường.
 */

const PROXY_PATH = '/api-hnue';

export const hnueService = {
  /**
   * Đăng nhập vào hệ thống trường
   */
  async login(username: string, password: string) {
    const response = await fetch(`${PROXY_PATH}/api/authenticate/authpsc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userName: username, 
        password: password,
        grant_type: 'password'
      })
    });
    
    if (!response.ok) throw new Error('Đăng nhập thất bại');
    return response.json();
  },

  /**
   * Lấy danh sách điểm tổng quát theo mã CTDT
   */
  async getMarks(token: string, username: string) {
    const k = username.substring(0, 2);
    const major = username.substring(3, 6);
    const ctdt = `DHCQK${k}${major}`;

    const response = await fetch(`${PROXY_PATH}/api/student/marks?ctdt=${ctdt}&&loai=SV`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Không thể lấy danh sách điểm');
    return response.json();
  },

  /**
   * Lấy chi tiết điểm thành phần (CC, DK, Thi)
   */
  async getMarkDetail(token: string, scheduleId: string) {
    try {
      const response = await fetch(`${PROXY_PATH}/api/student/showmarkdetail?id=${scheduleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.error('Error fetching detail for', scheduleId, e);
    }
    return null;
  }
};
