import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { REQUEST_CATEGORIES, ROLE_OPTIONS } from "../data/system";
import { getCurrentPosition } from "../utils/geo";

const defaultRegister = {
  role: "citizen",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  preferredDistanceKm: 10,
  vehicleAvailability: "none",
  skills: "",
  categoryTags: "food,medical,disaster",
  ngoName: "",
  organisationType: "",
  registrationNumber: "",
  coverageLabel: "",
  officeAddress: "",
};

function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState("choose");
  const [loginState, setLoginState] = useState({ email: "", password: "" });
  const [registerState, setRegisterState] = useState(defaultRegister);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const roleMeta = useMemo(
    () => ROLE_OPTIONS.find((item) => item.id === registerState.role) ?? ROLE_OPTIONS[0],
    [registerState.role],
  );

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(loginState.email, loginState.password);
      navigate("/emergency");
    } catch (authError) {
      setError(authError.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (registerState.password !== registerState.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const location = await getCurrentPosition().catch(() => null);
      await register({
        ...registerState,
        location,
        skills: registerState.skills
          .split(",")
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean),
        categoryTags: registerState.categoryTags
          .split(",")
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean),
      });
      navigate("/emergency");
    } catch (authError) {
      setError(authError.message || "Unable to create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-shell">
        <div className="auth-copy">
          <span className="section-label">Who are you?</span>
          <h1>Start with the role you play in the response network.</h1>
          <p>
            ResQLink changes the interface and live data around what you need to do next.
          </p>
        </div>

        {mode === "choose" ? (
          <div className="auth-card">
            <div className="role-grid">
              {ROLE_OPTIONS.map((role) => (
                <button
                  className="role-option"
                  key={role.id}
                  onClick={() => {
                    setRegisterState((current) => ({ ...current, role: role.id }));
                    setMode("register");
                  }}
                  type="button"
                >
                  <strong>{role.label}</strong>
                  <p>{role.description}</p>
                </button>
              ))}
            </div>

            <button className="ghost-button full-width" onClick={() => setMode("login")} type="button">
              I already have an account
            </button>
          </div>
        ) : null}

        {mode === "login" ? (
          <form className="auth-card form-stack" onSubmit={handleLogin}>
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
              <input
                onChange={(event) => setLoginState((current) => ({ ...current, password: event.target.value }))}
                type="password"
                value={loginState.password}
              />
            </label>

            {error ? <div className="form-alert">{error}</div> : null}

            <button className="primary-button full-width" disabled={submitting} type="submit">
              {submitting ? "Signing in..." : "Sign in"}
            </button>
            <button className="ghost-button full-width" onClick={() => setMode("choose")} type="button">
              Back
            </button>
          </form>
        ) : null}

        {mode === "register" ? (
          <form className="auth-card form-stack" onSubmit={handleRegister}>
            <div className="selected-role">
              <strong>{roleMeta.shortLabel}</strong>
              <button className="text-button" onClick={() => setMode("choose")} type="button">
                Change
              </button>
            </div>

            {registerState.role === "ngo" ? (
              <>
                <label>
                  NGO name
                  <input
                    onChange={(event) =>
                      setRegisterState((current) => ({ ...current, ngoName: event.target.value }))
                    }
                    value={registerState.ngoName}
                  />
                </label>
                <label>
                  Official email
                  <input
                    onChange={(event) =>
                      setRegisterState((current) => ({ ...current, email: event.target.value }))
                    }
                    type="email"
                    value={registerState.email}
                  />
                </label>
                <label>
                  Contact number
                  <input
                    onChange={(event) =>
                      setRegisterState((current) => ({ ...current, phone: event.target.value }))
                    }
                    value={registerState.phone}
                  />
                </label>
                <label>
                  Registration number
                  <input
                    onChange={(event) =>
                      setRegisterState((current) => ({
                        ...current,
                        registrationNumber: event.target.value,
                      }))
                    }
                    value={registerState.registrationNumber}
                  />
                </label>
                <label>
                  Services
                  <input
                    onChange={(event) =>
                      setRegisterState((current) => ({ ...current, categoryTags: event.target.value }))
                    }
                    placeholder="food,medical,disaster"
                    value={registerState.categoryTags}
                  />
                </label>
                <label className="full-span">
                  Office address
                  <input
                    onChange={(event) =>
                      setRegisterState((current) => ({ ...current, officeAddress: event.target.value }))
                    }
                    value={registerState.officeAddress}
                  />
                </label>
              </>
            ) : (
              <>
                <label>
                  Full name
                  <input
                    onChange={(event) =>
                      setRegisterState((current) => ({ ...current, fullName: event.target.value }))
                    }
                    value={registerState.fullName}
                  />
                </label>
                <label>
                  Email
                  <input
                    onChange={(event) =>
                      setRegisterState((current) => ({ ...current, email: event.target.value }))
                    }
                    type="email"
                    value={registerState.email}
                  />
                </label>
                <label>
                  Phone
                  <input
                    onChange={(event) =>
                      setRegisterState((current) => ({ ...current, phone: event.target.value }))
                    }
                    value={registerState.phone}
                  />
                </label>
                {registerState.role === "volunteer" ? (
                  <>
                    <label>
                      Skills
                      <input
                        onChange={(event) =>
                          setRegisterState((current) => ({ ...current, skills: event.target.value }))
                        }
                        placeholder="medical, transport, logistics"
                        value={registerState.skills}
                      />
                    </label>
                    <label>
                      Preferred distance (km)
                      <input
                        min="1"
                        onChange={(event) =>
                          setRegisterState((current) => ({
                            ...current,
                            preferredDistanceKm: event.target.value,
                          }))
                        }
                        type="number"
                        value={registerState.preferredDistanceKm}
                      />
                    </label>
                    <label className="full-span">
                      Categories
                      <input
                        onChange={(event) =>
                          setRegisterState((current) => ({ ...current, categoryTags: event.target.value }))
                        }
                        placeholder={REQUEST_CATEGORIES.map((item) => item.id).join(",")}
                        value={registerState.categoryTags}
                      />
                    </label>
                  </>
                ) : null}
              </>
            )}

            <label>
              Password
              <input
                onChange={(event) =>
                  setRegisterState((current) => ({ ...current, password: event.target.value }))
                }
                type="password"
                value={registerState.password}
              />
            </label>
            <label>
              Confirm password
              <input
                onChange={(event) =>
                  setRegisterState((current) => ({ ...current, confirmPassword: event.target.value }))
                }
                type="password"
                value={registerState.confirmPassword}
              />
            </label>

            {error ? <div className="form-alert">{error}</div> : null}

            <button className="primary-button full-width" disabled={submitting} type="submit">
              {submitting ? "Creating account..." : `Continue as ${roleMeta.shortLabel}`}
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}

export default AuthPage;
