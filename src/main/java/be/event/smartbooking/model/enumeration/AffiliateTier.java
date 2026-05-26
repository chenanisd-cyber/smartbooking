package be.event.smartbooking.model.enumeration;

public enum AffiliateTier {
    FREE(10),       // 10 requêtes par jour
    STARTER(100),   // 100 requêtes par jour
    PREMIUM(-1);    // -1 = illimité

    private final int dailyQuota;

    AffiliateTier(int dailyQuota) {
        this.dailyQuota = dailyQuota;
    }

    public int getDailyQuota() {
        return dailyQuota;
    }

    public boolean isUnlimited() {
        return dailyQuota < 0;
    }
}