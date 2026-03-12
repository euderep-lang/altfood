import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ReferralRedirect() {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      localStorage.setItem('altfood_referral_code', code);
    }
    navigate('/register', { replace: true });
  }, [code, navigate]);

  return null;
}
