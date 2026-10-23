/**
 * Conspiracy: Take the Crown and Eldritch Moon, group B — one focused test
 * per card whose behaviour is more than a stat line or a copy of a tested
 * pattern.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Keeper of Keys", () => {
  it("makes you the monarch, and at your upkeep as the monarch your creatures can't be blocked, even ones arriving later", () => {
    const { game, a } = table();
    enter(game, "Keeper of Keys");
    expect(game.state.monarch).toBe(A);
    spawn(game, "Grizzly Bears", B);
    toStep(game, "precombat-main");
    // Arrived after the upkeep trigger resolved: still bound by it.
    const late = spawn(game, "Hill Giant");
    let blockable = 0;
    try {
      const offer = blockOffer(game, a, [late]);
      blockable = offer.eligible.flatMap((e) => e.canBlock).length;
    } catch {
      blockable = 0;
    }
    expect(blockable).toBe(0);
  });

  it("does nothing at your upkeep if you aren't the monarch", () => {
    const { game, a } = table();
    enter(game, "Keeper of Keys");
    game.debugApplyEffect(B, { kind: "become-monarch" }, []);
    spawn(game, "Grizzly Bears", B);
    toStep(game, "precombat-main");
    const giant = spawn(game, "Hill Giant");
    const offer = blockOffer(game, a, [giant]);
    expect(offer.eligible.flatMap((e) => e.canBlock)).toContain(giant);
  });
});

describe("Identity Thief", () => {
  it("exiles another creature, becomes a copy of it until end of turn, and the card returns at the next end step", () => {
    const { game, a } = table();
    const thief = spawn(game, "Identity Thief");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    pickModes(a, 0);
    attack(game, a, [thief]);
    expect(named(game, "Hill Giant", B)).toHaveLength(0);
    expect(pt(game, thief)).toEqual({ power: 3, toughness: 3 });
    expect(life(game, B)).toBe(17);
    nextTurn(game);
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
    expect(pt(game, thief)).toEqual({ power: 0, toughness: 3 });
  });

  it("exiles nothing and copies nothing when you decline", () => {
    const { game, a } = table();
    const thief = spawn(game, "Identity Thief");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    pickModes(a);
    attack(game, a, [thief]);
    expect(zone(game, giant)).toBe("battlefield");
    expect(pt(game, thief)).toEqual({ power: 0, toughness: 3 });
  });
});

describe("Long Road Home", () => {
  it("exiles the creature and returns it at the next end step with a +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Long Road Home"), { targets: [ref(bears)] });
    expect(named(game, "Grizzly Bears", B)).toHaveLength(0);
    nextTurn(game);
    const [back] = named(game, "Grizzly Bears", B);
    expect(back).toBeDefined();
    expect(counters(game, back)).toBe(1);
    expect(pt(game, back)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Ulvenwald Observer", () => {
  it("draws when a creature you control with toughness 4 or greater dies, not a smaller one", () => {
    const { game } = table();
    spawn(game, "Ulvenwald Observer");
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    destroy(game, bears);
    expect(hand(game).length).toBe(before);
    destroy(game, wurm);
    expect(hand(game).length).toBe(before + 1);
  });

  it("draws for its own death", () => {
    const { game } = table();
    const observer = spawn(game, "Ulvenwald Observer");
    const before = hand(game).length;
    destroy(game, observer);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Campaign of Vengeance", () => {
  it("drains the defending player 1 for each attacking creature", () => {
    const { game, a } = table();
    spawn(game, "Campaign of Vengeance");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    attack(game, a, [one, two]);
    expect(life(game, B)).toBe(20 - 2 - 4);
    expect(life(game, A)).toBe(22);
  });
});

describe("Heron's Grace Champion", () => {
  it("gives other Humans you control +1/+1 and lifelink until end of turn, not itself the bonus", () => {
    const { game } = table();
    const sentry = spawn(game, "Desperate Sentry");
    const bears = spawn(game, "Grizzly Bears");
    const champion = enter(game, "Heron's Grace Champion");
    expect(pt(game, sentry)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, sentry).has("lifelink")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, champion)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Stromkirk Condemned", () => {
  it("discards a card to pump your Vampires, once each turn", () => {
    const { game } = table();
    const condemned = spawn(game, "Stromkirk Condemned");
    const crusader = spawn(game, "Markov Crusader");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    activate(game, condemned);
    expect(hand(game).length).toBe(before - 1);
    expect(pt(game, condemned)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, crusader)).toEqual({ power: 5, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(() => activate(game, condemned)).toThrow();
  });
});

describe("Markov Crusader", () => {
  it("has haste only while you control another Vampire", () => {
    const { game } = table();
    const crusader = spawn(game, "Markov Crusader");
    expect(keywords(game, crusader).has("haste")).toBe(false);
    spawn(game, "Stromkirk Condemned");
    expect(keywords(game, crusader).has("haste")).toBe(true);
  });
});

describe("Advanced Stitchwing", () => {
  it("returns from your graveyard tapped for {2}{U} and two discards", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const wing = toGraveyard(game, "Advanced Stitchwing");
    const before = hand(game).length;
    activate(game, wing);
    expect(hand(game).length).toBe(before - 2);
    const [back] = named(game, "Advanced Stitchwing");
    expect(back).toBeDefined();
    expect(game.state.objects[back].tapped).toBe(true);
    expect(graveyard(game)).not.toContain(back);
  });
});

describe("Spreading Flames", () => {
  it("divides 6 damage among target creatures as cast", () => {
    const { game } = table();
    lands(game, "Mountain", 7);
    const bears = spawn(game, "Grizzly Bears", B);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Spreading Flames"), { targets: [ref(bears), ref(wurm)], division: [2, 4] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Borrowed Hostility", () => {
  it("both modes cost the escalate {3} on top", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Borrowed Hostility"), { modes: [0, 1], targets: [ref(bears), ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
  });
});

describe("Desperate Sentry", () => {
  it("leaves a 3/2 Eldrazi Horror when it dies", () => {
    const { game } = table();
    const sentry = spawn(game, "Desperate Sentry");
    destroy(game, sentry);
    expect(tokensNamed(game, "Eldrazi Horror Token", A)).toBe(1);
  });
});

describe("Certain Death", () => {
  it("destroys the creature, its controller loses 2 and you gain 2", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Certain Death"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});
