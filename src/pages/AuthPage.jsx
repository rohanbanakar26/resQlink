import { doc, getDoc } from "firebase/firestore";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { getCurrentPosition } from "../utils/geo";

const initialRegisterState = {
  name: "",
  phone: "",
  otp: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "user",
  profilePhoto: "",
  skills: "Delivery, Medical Help",
  available: true,
  preferredDistanceRange: "5 km",
  categoryTags: "food-shortage, disaster-relief",
  previousActivities: "",
  vehicleAvailability: "none",
  hybridMode: true,
  ngoName: "",
  registrationNumber: "",
  contactPerson: "",
  officeAddress: "",
  registrationCertificate: "",
  taxProof: "",
  officeProof: "",
  authorizedId: "",
  officePhoto: "",
};

const roleCards = [
  ["user", "Citizen", "Report needs and track support"],
  ["volunteer", "Volunteer", "Join nearby response work"],
  ["ngo", "NGO", "Coordinate requests and resources"],
];

function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState("choose");
  const [loginState, setLoginState] = useState({ email: "", password: "" });
  const [registerState, setRegisterState] = useState(initialRegisterState);
  const [error, setError] = useState("");
  const [ngoStep, setNgoStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const isNgo = registerState.role === "ngo";
  const roleLabel = useMemo(
    () => roleCards.find(([value]) => value === registerState.role)?.[1] || "Citizen",
    [registerState.role],
  );

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const credentials = await login(loginState.email, loginState.password);
      const userDoc = await getDoc(doc(db, "users", credentials.user.uid));
      const role = userDoc.exists() ? userDoc.data().role : null;
      navigate(role === "ngo" ? "/ngo" : role === "volunteer" ? "/volunteer" : "/app");
    } catch (authError) {
      setError(authError.message);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (isNgo && ngoStep < 3) {
        setNgoStep((current) => current + 1);
        return;
      }
      if (registerState.password !== registerState.confirmPassword) {
        setError("Password and confirm password do not match.");
        return;
      }

      const location = await getCurrentPosition();
      const user = await register({
        ...registerState,
        location,
        skills: registerState.skills
          .split(",")
          .map((skill) => skill.trim().toLowerCase())
          .filter(Boolean),
        categoryTags: registerState.categoryTags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean),
        documentLinks: {
          registrationCertificate: registerState.registrationCertificate,
          taxProof: registerState.taxProof,
          officeProof: registerState.officeProof,
          authorizedId: registerState.authorizedId,
        },
        officialEmailDomain: !registerState.email.endsWith("@gmail.com"),
        adminReviewStatus: "pending",
      });
      navigate(
        registerState.role === "ngo"
          ? "/ngo"
          : registerState.role === "volunteer"
            ? "/volunteer"
            : user
              ? "/app"
              : "/",
      );
    } catch (authError) {
      setError(authError.message);
    }
  };

  return (
    <div className="v2-auth-page">
      <section className="v2-auth-shell">
        <div className="v2-auth-head">
          <button className="v2-inline-link" onClick={() => navigate("/")} type="button">
            Back
          </button>
          <p className="v2-kicker">Account access</p>
          <h1>{mode === "login" ? "Welcome back" : mode === "choose" ? "Choose your role" : `Register as ${roleLabel}`}</h1>
          <p>
            Keep the flow simple. Register fast, then move directly into reporting, coordination, or volunteer work.
          </p>
        </div>

        {mode === "choose" && (
          <div className="v2-auth-card">
            <div className="v2-auth-role-grid">
              {roleCards.map(([value, label, description]) => (
                <button
                  className="v2-auth-role"
                  key={value}
                  onClick={() => {
                    setRegisterState((current) => ({ ...current, role: value }));
                    setNgoStep(1);
                    setMode("register");
                  }}
                  type="button"
                >
                  <strong>{label}</strong>
                  <p>{description}</p>
                </button>
              ))}
            </div>
            <button className="v2-secondary-button full-width-button" onClick={() => setMode("login")} type="button">
              I already have an account
            </button>
          </div>
        )}

        {mode === "login" && (
          <form className="v2-auth-card v2-auth-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                onChange={(event) => setLoginState((current) => ({ ...current, email: event.target.value }))}
                type="email"
                value={loginState.email}
              />
            </label>
            <label>
              Password
              <div className="v2-password-row">
                <input
                  onChange={(event) => setLoginState((current) => ({ ...current, password: event.target.value }))}
                  type={showPassword ? "text" : "password"}
                  value={loginState.password}
                />
                <button className="v2-inline-link" onClick={() => setShowPassword((current) => !current)} type="button">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
            <button className="v2-primary-button full-width-button" type="submit">
              Sign In
            </button>
            <button className="v2-secondary-button full-width-button" onClick={() => setMode("choose")} type="button">
              Create account instead
            </button>
            {error && <div className="form-message">{error}</div>}
          </form>
        )}

        {mode === "register" && (
          <form className="v2-auth-card v2-auth-form" onSubmit={handleRegister}>
            {isNgo && (
              <div className="v2-step-strip">
                {[1, 2, 3].map((step) => (
                  <span className={step <= ngoStep ? "active" : ""} key={step} />
                ))}
              </div>
            )}

            {!isNgo && (
              <>
                <label>
                  Full name
                  <input onChange={(event) => setRegisterState((current) => ({ ...current, name: event.target.value }))} value={registerState.name} />
                </label>
                <label>
                  Phone
                  <input onChange={(event) => setRegisterState((current) => ({ ...current, phone: event.target.value }))} value={registerState.phone} />
                </label>
                <label>
                  Email
                  <input onChange={(event) => setRegisterState((current) => ({ ...current, email: event.target.value }))} type="email" value={registerState.email} />
                </label>
                <label>
                  Password
                  <input onChange={(event) => setRegisterState((current) => ({ ...current, password: event.target.value }))} type="password" value={registerState.password} />
                </label>
                <label className="full-span">
                  Confirm password
                  <input onChange={(event) => setRegisterState((current) => ({ ...current, confirmPassword: event.target.value }))} type="password" value={registerState.confirmPassword} />
                </label>
                {registerState.role === "volunteer" && (
                  <>
                    <label>
                      Preferred distance
                      <input onChange={(event) => setRegisterState((current) => ({ ...current, preferredDistanceRange: event.target.value }))} value={registerState.preferredDistanceRange} />
                    </label>
                    <label>
                      Vehicle
                      <input onChange={(event) => setRegisterState((current) => ({ ...current, vehicleAvailability: event.target.value }))} value={registerState.vehicleAvailability} />
                    </label>
                    <label className="full-span">
                      Skills
                      <input onChange={(event) => setRegisterState((current) => ({ ...current, skills: event.target.value }))} value={registerState.skills} />
                    </label>
                  </>
                )}
              </>
            )}

            {isNgo && ngoStep === 1 && (
              <>
                <label>
                  NGO name
                  <input onChange={(event) => setRegisterState((current) => ({ ...current, ngoName: event.target.value }))} value={registerState.ngoName} />
                </label>
                <label>
                  Registration number
                  <input onChange={(event) => setRegisterState((current) => ({ ...current, registrationNumber: event.target.value }))} value={registerState.registrationNumber} />
                </label>
                <label>
                  Contact person
                  <input onChange={(event) => setRegisterState((current) => ({ ...current, contactPerson: event.target.value }))} value={registerState.contactPerson} />
                </label>
                <label>
                  Official email
                  <input onChange={(event) => setRegisterState((current) => ({ ...current, email: event.target.value }))} type="email" value={registerState.email} />
                </label>
              </>
            )}

            {isNgo && ngoStep === 2 && (
              <>
                <label className="full-span">
                  Registration certificate URL
                  <input onChange={(event) => setRegisterState((current) => ({ ...current, registrationCertificate: event.target.value }))} value={registerState.registrationCertificate} />
                </label>
                <label className="full-span">
                  Office proof URL
                  <input onChange={(event) => setRegisterState((current) => ({ ...current, officeProof: event.target.value }))} value={registerState.officeProof} />
                </label>
              </>
            )}

            {isNgo && ngoStep === 3 && (
              <>
                <label className="full-span">
                  Office address
                  <input onChange={(event) => setRegisterState((current) => ({ ...current, officeAddress: event.target.value }))} value={registerState.officeAddress} />
                </label>
                <label>
                  Password
                  <input onChange={(event) => setRegisterState((current) => ({ ...current, password: event.target.value }))} type="password" value={registerState.password} />
                </label>
                <label>
                  Confirm password
                  <input onChange={(event) => setRegisterState((current) => ({ ...current, confirmPassword: event.target.value }))} type="password" value={registerState.confirmPassword} />
                </label>
              </>
            )}

            <button className="v2-primary-button full-width-button" type="submit">
              {isNgo && ngoStep < 3 ? "Continue" : "Create Account"}
            </button>
            <button className="v2-secondary-button full-width-button" onClick={() => setMode("choose")} type="button">
              Change role
            </button>
            {error && <div className="form-message">{error}</div>}
          </form>
        )}
      </section>
    </div>
  );
}

export default AuthPage;
