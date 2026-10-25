/**
 * Magic Origins, group B. One test per clause most likely to be wrong:
 * Sigil of Valor's count of the attacker's companions, Demonic Pact's
 * "choose one that hasn't been chosen", Ravaging Blaze's spell-mastery damage to the controller, Calculated
 * Dismissal's spell mastery after the counter, Gilt-Leaf Winnower's
 * unequal-P/T non-Elf target, Send to Sleep's skipped untap, Somberwald
 * Alpha's pump of a blocked creature, Consecrated by Blood's granted
 * regeneration, Shadows of the Past's activation gate, Aerial Volley's
 * division, Nightsnare's two-card fallback, Undead Servant's and Cleric of
 * the Forward Order's name counts.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  nextTurn,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Sigil of Valor", () => {
  it("pumps a lone attacker once for each other creature you control", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    const sigil = spawn(game, "Sigil of Valor");
    const hero = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    pickTargets(a, hero);
    activate(game, sigil, 0, { targets: [ref(hero)] });
    a.declareAttackersFn = () => [{ attacker: hero, defender: B }];
    toStep(game, "declare-blockers");
    expect(pt(game, hero)).toEqual({ power: 4, toughness: 4 }); // two others, not itself or bob's
  });
});

describe("Demonic Pact", () => {
  it("never offers a mode it has already had chosen", () => {
    const { game, a } = table();
    spawn(game, "Demonic Pact");
    const offered: (readonly string[])[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered.push(texts);
      const draw = texts.findIndex((t) => t.includes("Draw two"));
      return [draw >= 0 ? draw : texts.findIndex((t) => t.includes("discards two"))];
    };
    const before = hand(game, A).length;
    toStep(game, "precombat-main"); // alice's next turn: upkeep trigger, draw step
    expect(hand(game, A).length).toBe(before + 3);
    toStep(game, "precombat-main");
    expect(offered).toHaveLength(2);
    expect(offered[0]).toHaveLength(4);
    expect(offered[1]).toHaveLength(3);
    expect(offered[1].some((t) => t.includes("Draw two"))).toBe(false);
    expect(life(game, A)).toBe(20);
  });
});

describe("Ravaging Blaze", () => {
  it("also deals X to the creature's controller with spell mastery", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    toGraveyard(game, "Shock");
    toGraveyard(game, "Lightning Bolt");
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Ravaging Blaze"), { x: 3, targets: [ref(angel)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, angel)).toBe("battlefield");
  });

  it("deals nothing to the controller without it", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    toGraveyard(game, "Shock");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Ravaging Blaze"), { x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Calculated Dismissal", () => {
  it("counts the spell it just countered for spell mastery", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 1);
    toGraveyard(game, "Lightning Bolt");
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Calculated Dismissal"), { targets: [ref(shock)] });
    expect(zone(game, shock)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(scried).toBe(2);
  });
});

describe("Gilt-Leaf Winnower", () => {
  it("may target only a non-Elf creature whose power and toughness differ", () => {
    const { game, a } = table();
    const spider = spawn(game, "Giant Spider", B); // 2/4
    const drake = spawn(game, "Storm Crow", B); // 1/2
    const bears = spawn(game, "Grizzly Bears", B); // 2/2
    const elf = spawn(game, "Gilt-Leaf Winnower", B); // 4/3 Elf
    const seen = watchTargets(a, (offered) => [offered[0].includes(spider) ? spider : null]);
    a.chooseModesFn = () => [0];
    enter(game, "Gilt-Leaf Winnower");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(spider);
    expect(seen.offered[0]).toContain(drake);
    expect(seen.offered[0]).not.toContain(bears);
    expect(seen.offered[0]).not.toContain(elf);
    expect(zone(game, spider)).toBe("graveyard");
  });
});

describe("Send to Sleep", () => {
  it("keeps both creatures tapped through their next untap step with spell mastery", () => {
    const { game } = table();
    lands(game, "Island", 2);
    toGraveyard(game, "Shock");
    toGraveyard(game, "Lightning Bolt");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Send to Sleep"), { targets: [ref(one), ref(two)] });
    expect(game.state.objects[one].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[one].tapped).toBe(true);
    expect(game.state.objects[two].tapped).toBe(true);
  });
});

describe("Somberwald Alpha", () => {
  it("gives a blocked creature you control +1/+1", () => {
    const { game, a, b } = table();
    spawn(game, "Somberwald Alpha");
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, blocker)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Consecrated by Blood", () => {
  it("lets the enchanted creature regenerate by sacrificing two others", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Walking Corpse");
    spawn(game, "Walking Corpse");
    cast(game, toHand(game, "Consecrated by Blood"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    activate(game, bears, 0);
    expect(graveyard(game, A).filter((id) => game.state.objects[id].cardName === "Walking Corpse")).toHaveLength(2);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Shadows of the Past", () => {
  it("drains only with four creature cards in your graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 10);
    const shadows = spawn(game, "Shadows of the Past");
    for (let i = 0; i < 3; i++) toGraveyard(game, "Grizzly Bears");
    expect(() => activate(game, shadows)).toThrow();
    toGraveyard(game, "Grizzly Bears");
    activate(game, shadows);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Aerial Volley", () => {
  it("divides 3 damage among creatures with flying", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const drake = spawn(game, "Wind Drake", B);
    const crow = spawn(game, "Storm Crow", B);
    cast(game, toHand(game, "Aerial Volley"), { targets: [ref(drake), ref(crow)], division: [2, 1] });
    expect(zone(game, drake)).toBe("graveyard");
    expect(zone(game, crow)).toBe("battlefield");
  });
});

describe("Nightsnare", () => {
  it("makes the opponent discard two when you choose nothing", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    a.chooseFromZoneFn = () => [];
    const before = hand(game, B).length;
    cast(game, toHand(game, "Nightsnare"), { targets: [ref(B)] });
    settle(game);
    expect(hand(game, B).length).toBe(before - 2);
  });
});

describe("Undead Servant", () => {
  it("makes a Zombie for each Undead Servant in your own graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Undead Servant");
    toGraveyard(game, "Undead Servant");
    toGraveyard(game, "Undead Servant", B);
    enter(game, "Undead Servant");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(2);
  });
});

describe("Cleric of the Forward Order", () => {
  it("gains 2 life for each Cleric of the Forward Order you control", () => {
    const { game } = table();
    spawn(game, "Cleric of the Forward Order");
    spawn(game, "Cleric of the Forward Order", B);
    enter(game, "Cleric of the Forward Order");
    expect(life(game, A)).toBe(24);
  });
});

describe("Displacement Wave", () => {
  it("returns each nonland permanent with mana value X or less, X read from the cast", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring", B);
    const giant = spawn(game, "Hill Giant", B);
    const [island] = lands(game, "Island", 4);
    cast(game, toHand(game, "Displacement Wave"), { x: 2 });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, island)).toBe("battlefield");
  });
});
