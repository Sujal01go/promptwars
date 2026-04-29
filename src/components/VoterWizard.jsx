import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

export default function VoterWizard() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ age: null, citizen: null, documents: null });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const reset = () => { setStep(1); setAnswers({ age: null, citizen: null, documents: null }); };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', overflow: 'hidden' }}>
      <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', background: 'rgba(99, 102, 241, 0.05)' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCheck size={24} color="var(--primary)" /> Voter Registration Wizard
        </h3>
        <p style={{ color: 'var(--text-muted)' }}>Find out how to register to vote in 3 simple steps.</p>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ flex: 1, height: '4px', background: s <= step ? 'var(--primary)' : 'var(--border)', borderRadius: '2px', transition: 'background 0.3s ease' }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '2rem' }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Are you an Indian citizen?</h4>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className={`btn ${answers.citizen === true ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => { setAnswers({ ...answers, citizen: true }); setTimeout(nextStep, 300); }}>Yes</button>
                <button className={`btn ${answers.citizen === false ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => { setAnswers({ ...answers, citizen: false }); setTimeout(nextStep, 300); }}>No</button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Are you 18 years of age or older?</h4>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className={`btn ${answers.age === true ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => { setAnswers({ ...answers, age: true }); setTimeout(nextStep, 300); }}>Yes</button>
                <button className={`btn ${answers.age === false ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => { setAnswers({ ...answers, age: false }); setTimeout(nextStep, 300); }}>No</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Do you have a valid Proof of Address and Age?</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>(e.g., Aadhaar card, Passport, Driving License, 10th marksheet)</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className={`btn ${answers.documents === true ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => { setAnswers({ ...answers, documents: true }); setTimeout(nextStep, 300); }}>Yes</button>
                <button className={`btn ${answers.documents === false ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => { setAnswers({ ...answers, documents: false }); setTimeout(nextStep, 300); }}>No</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              {answers.citizen && answers.age && answers.documents ? (
                <div style={{ textAlign: 'center' }}>
                  <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--success)' }}>You are eligible to vote!</h4>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You can register online by filling out <strong>Form 6</strong> on the official NVSP (National Voter's Service Portal) website.</p>
                  <a href="https://voters.eci.gov.in/" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    Go to NVSP Portal <ArrowRight size={16} />
                  </a>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <AlertCircle size={48} color="var(--error)" style={{ margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--error)' }}>Registration Incomplete</h4>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    {!answers.citizen && "Only Indian citizens are eligible to vote in Indian elections. "}
                    {!answers.age && "You must be at least 18 years old to vote. "}
                    {!answers.documents && "You need valid proof of address and age to register. "}
                  </p>
                  <button className="btn btn-secondary" onClick={reset}>Start Over</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
