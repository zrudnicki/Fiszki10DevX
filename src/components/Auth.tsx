import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../db/supabase";
import { useEffect, useState } from "react";

export const Auth = () => {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        window.location.href = "/";
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white/5 backdrop-blur-lg rounded-lg shadow-xl border border-white/10">
      <SupabaseAuth
        supabaseClient={supabase}
        view="sign_in"
        appearance={{
          theme: ThemeSupa,
          style: {
            button: {
              background: "rgb(79, 70, 229)",
              borderRadius: "6px",
              color: "white",
              height: "40px",
            },
            input: {
              borderRadius: "6px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "white",
            },
            label: {
              color: "rgba(255, 255, 255, 0.8)",
            },
          },
          className: {
            container: "auth-container",
            button: "auth-button",
            input: "auth-input",
            label: "auth-label",
          },
        }}
        theme="dark"
        providers={["google", "github"]}
        redirectTo={origin ? `${origin}/auth/callback` : undefined}
        onlyThirdPartyProviders={false}
        localization={{
          variables: {
            sign_in: {
              email_label: "Adres email",
              password_label: "Hasło",
              button_label: "Zaloguj się",
              loading_button_label: "Logowanie...",
              social_provider_text: "Zaloguj się przez {{provider}}",
              link_text: "Masz już konto? Zaloguj się",
            },
            sign_up: {
              email_label: "Adres email",
              password_label: "Hasło",
              button_label: "Zarejestruj się",
              loading_button_label: "Rejestracja...",
              social_provider_text: "Zarejestruj się przez {{provider}}",
              link_text: "Nie masz konta? Zarejestruj się",
            },
          },
        }}
      />
    </div>
  );
};
