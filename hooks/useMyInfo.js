import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import * as settingsService from "../lib/services/settingsService";

const DEFAULT_INFO = { name: "", address: "", siret: "", logo: "", template: "classic", accentColor: "#d97706", currency: "EUR" };

export default function useMyInfo() {
  const [myInfo, setMyInfo] = useState(DEFAULT_INFO);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        if (user) {
          const { data, error } = await settingsService.getSettings(user.id);
          if (!error && data) setMyInfo({ ...DEFAULT_INFO, ...data });
          else {
            const info = await window.storage.get("myInfo");
            if (info) setMyInfo(JSON.parse(info.value));
          }
        } else {
          const info = await window.storage.get("myInfo");
          if (info) setMyInfo(JSON.parse(info.value));
        }
      } catch {
        // keep defaults when persistence is unavailable
      }
      setLoading(false);
    })();
  }, [user]);

  const persistInfo = async (next) => {
    setMyInfo(next);
    try {
      if (user) {
        await settingsService.upsertSettings(user.id, next);
      } else {
        await window.storage.set("myInfo", JSON.stringify(next));
      }
    } catch {
      // settings persistence is best-effort
    }
  };

  return { myInfo, setMyInfo, persistInfo, loading };
}
