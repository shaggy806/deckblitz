/**
 * Shadowmoor (SHM; B183), group A. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  lands,
  life,
  named,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Firespout", () => {
  it("with only {R} spent, damages only creatures without flying", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const drake = spawn(game, "Wind Drake", B);
    cast(game, toHand(game, "Firespout"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, drake)).toBe("battlefield");
  });

  it("with {R} and {G} spent, damages both", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const drake = spawn(game, "Wind Drake", B);
    cast(game, toHand(game, "Firespout"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, drake)).toBe("graveyard");
  });
});

describe("Wicker Warcrawler", () => {
  it("deals its full damage, then gets the counter at end of combat", () => {
    const { game, a } = table();
    const crawler = spawn(game, "Wicker Warcrawler");
    attack(game, a, [crawler]);
    expect(life(game, B)).toBe(14);
    expect(counters(game, crawler, "-1/-1")).toBe(1);
  });
});

describe("Wild Swing", () => {
  it("destroys exactly one of the three targets", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const targets = [spawn(game, "Grizzly Bears", B), spawn(game, "Wind Drake", B), spawn(game, "Grizzly Bears", B)];
    cast(game, toHand(game, "Wild Swing"), { targets: targets.map(ref) });
    expect(targets.filter((id) => zone(game, id) === "graveyard")).toHaveLength(1);
  });

  it("destroys the one target still legal when the other two have gone, whatever the seed", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { game } = table({ seed });
      lands(game, "Mountain", 4);
      const targets = [spawn(game, "Grizzly Bears", B), spawn(game, "Wind Drake", B), spawn(game, "Grizzly Bears", B)];
      cast(game, toHand(game, "Wild Swing"), { targets: targets.map(ref), settle: false });
      destroy(game, targets[0]);
      destroy(game, targets[1]);
      settle(game);
      expect(zone(game, targets[2])).toBe("graveyard");
    }
  });
});

describe("Grief Tyrant", () => {
  it("enters as a 4/4 and, dying, puts its four counters on the target", () => {
    const { game, a } = table();
    const tyrant = enter(game, "Grief Tyrant");
    expect(pt(game, tyrant)).toEqual({ power: 4, toughness: 4 });
    const crawler = spawn(game, "Wicker Warcrawler", B);
    pickTargets(a, crawler);
    destroy(game, tyrant);
    settle(game);
    expect(counters(game, crawler, "-1/-1")).toBe(4);
  });
});

describe("Deep-Slumber Titan", () => {
  it("enters tapped and untaps when dealt damage", () => {
    const { game } = table();
    const titan = enter(game, "Deep-Slumber Titan");
    expect(game.state.objects[titan].tapped).toBe(true);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(titan)] });
    expect(game.state.objects[titan].tapped).toBe(false);
  });
});

describe("Demigod of Revenge", () => {
  it("returns the Demigods in your graveyard as it's cast", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const old = toGraveyard(game, "Demigod of Revenge");
    cast(game, toHand(game, "Demigod of Revenge"));
    expect(zone(game, old)).toBe("battlefield");
    expect(named(game, "Demigod of Revenge", A)).toHaveLength(2);
    expect(graveyard(game, A)).toHaveLength(0);
  });
});

describe("Woeleecher", () => {
  it("gains life only when a -1/-1 counter was removed", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const [first, second] = [spawn(game, "Woeleecher"), spawn(game, "Woeleecher")];
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, first, 0, { targets: [ref(bears)] });
    expect(life(game, A)).toBe(20);
    const crawler = spawn(game, "Wicker Warcrawler", B);
    game.state.objects[crawler].counters = { "-1/-1": 2 };
    activate(game, second, 0, { targets: [ref(crawler)] });
    expect(counters(game, crawler, "-1/-1")).toBe(1);
    expect(life(game, A)).toBe(22);
  });
});

describe("Mudbrawler Cohort", () => {
  it("gets +1/+1 only with another red creature", () => {
    const { game } = table();
    const cohort = spawn(game, "Mudbrawler Cohort");
    expect(pt(game, cohort)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Mudbrawler Cohort", B);
    expect(pt(game, cohort)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Intimidator Initiate");
    expect(pt(game, cohort)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Crowd of Cinders", () => {
  it("counts the black permanents you control, itself included", () => {
    const { game } = table();
    const crowd = spawn(game, "Crowd of Cinders");
    spawn(game, "Sootwalkers");
    spawn(game, "Crowd of Cinders", B);
    expect(pt(game, crowd)).toEqual({ power: 2, toughness: 2 });
  });
});
