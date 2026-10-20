/**
 * Zendikar Rising and its Commander decks (ZNR, ZNC) — group d of the set
 * walk: party payoffs, kicker, and the Rogue/Warrior/Cleric/Wizard support.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";

/** A full party for alice: a Cleric, a Rogue, a Warrior and a Wizard. */
function fullParty(game: Game): ObjectId[] {
  return ["Attended Healer", "Drana's Silencer", "Kargan Warleader", "Tazeem Roilmage"].map((name) => spawn(game, name));
}

describe("Oran-Rief Ooze", () => {
  it("counters a creature as it enters, then grows each attacker that already has one", () => {
    const { game, a } = table();
    const marked = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    pickTargets(a, marked);
    const ooze = enter(game, "Oran-Rief Ooze");
    expect(counters(game, marked)).toBe(1);
    attack(game, a, [ooze, marked, plain]);
    expect(counters(game, marked)).toBe(2);
    expect(counters(game, plain)).toBe(0);
    expect(counters(game, ooze)).toBe(0);
  });
});

describe("Zagras, Thief of Heartbeats", () => {
  it("costs {1} less per party member and gives other creatures deathtouch", () => {
    const { game } = table();
    spawn(game, "Kargan Warleader");
    spawn(game, "Attended Healer");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 2);
    const zagras = toHand(game, "Zagras, Thief of Heartbeats");
    cast(game, zagras);
    expect(zone(game, zagras)).toBe("battlefield");
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
  });

  it("destroys a planeswalker a creature you control dealt combat damage to", () => {
    const { game, a } = table();
    spawn(game, "Zagras, Thief of Heartbeats");
    const bears = spawn(game, "Grizzly Bears");
    const chandra = spawn(game, "Chandra, Acolyte of Flame", B);
    game.state.objects[chandra].counters.loyalty = 5;
    attack(game, a, [bears], chandra);
    expect(zone(game, chandra)).toBe("graveyard");
  });
});

describe("Kargan Warleader", () => {
  it("pumps other Warriors only", () => {
    const { game } = table();
    const kargan = spawn(game, "Kargan Warleader");
    const goma = spawn(game, "Goma Fada Vanguard");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, kargan)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, goma)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Attended Healer", () => {
  it("makes one Cat for the first life gain each turn only", () => {
    const { game } = table();
    spawn(game, "Attended Healer");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Cat Token (Arahbo, the First Fang)", A)).toBe(1);
  });

  it("gives another Cleric lifelink, but can't target itself", () => {
    const { game } = table();
    const healer = spawn(game, "Attended Healer");
    const other = spawn(game, "Expedition Healer");
    lands(game, "Plains", 1);
    lands(game, "Wastes", 2);
    expect(() => activate(game, healer, 0, { targets: [ref(healer)] })).toThrow();
    activate(game, healer, 0, { targets: [ref(other)] });
    expect(keywords(game, other).has("lifelink")).toBe(true);
  });
});

describe("Ghastly Gloomhunter", () => {
  it("enters with two +1/+1 counters when kicked", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Wastes", 4);
    const bat = toHand(game, "Ghastly Gloomhunter");
    cast(game, bat, { kicked: true });
    expect(counters(game, bat)).toBe(2);
  });
});

describe("Chilling Trap", () => {
  it("draws only if you control a Wizard", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    const first = toHand(game, "Chilling Trap");
    const before = hand(game).length;
    cast(game, first, { targets: [ref(bears)] });
    expect(hand(game).length).toBe(before - 1);
    expect(pt(game, bears)).toEqual({ power: -2, toughness: 2 });
    spawn(game, "Tazeem Roilmage");
    const second = toHand(game, "Chilling Trap");
    const after = hand(game).length;
    cast(game, second, { targets: [ref(bears)] });
    expect(hand(game).length).toBe(after);
  });
});

describe("Goma Fada Vanguard", () => {
  it("can target only a creature with power at most your Warrior count", () => {
    const { game, a } = table();
    const goma = spawn(game, "Goma Fada Vanguard");
    spawn(game, "Attended Healer"); // not a Warrior
    const bears = spawn(game, "Grizzly Bears", B);
    const big = spawn(game, "Kargan Warleader", B);
    const cantBlock = (id: ObjectId): boolean =>
      game.state.objects[id].modifiers.some((m) => (m.restrictions ?? []).includes("cant-block"));
    // One Warrior: neither the 2-power Bears nor the 3-power Warleader is a
    // legal target, so the ability is removed (rule 603.3d).
    attack(game, a, [goma]);
    expect(cantBlock(bears)).toBe(false);
    spawn(game, "Kargan Warleader"); // two Warriors now: the Bears only
    attack(game, a, [goma]);
    expect(cantBlock(bears)).toBe(true);
    expect(cantBlock(big)).toBe(false);
  });
});

describe("Sure-Footed Infiltrator", () => {
  it("taps another Rogue to become unblockable, and can't tap itself", () => {
    const { game } = table();
    const infiltrator = spawn(game, "Sure-Footed Infiltrator");
    expect(() => activate(game, infiltrator, 0)).toThrow();
    const rogue = spawn(game, "Drana's Silencer");
    activate(game, infiltrator, 0);
    expect(game.state.objects[rogue].tapped).toBe(true);
    expect(game.state.objects[infiltrator].tapped).toBe(false);
    expect(keywords(game, infiltrator).has("unblockable")).toBe(true);
  });
});

describe("Mind Drain", () => {
  it("discards two, mills one, drains one", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    const bobsHand = hand(game, B).length;
    cast(game, toHand(game, "Mind Drain"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(bobsHand - 2);
    expect(graveyard(game, B).length).toBe(3);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });
});

describe("Skyclave Plunder", () => {
  it("looks at three plus the party, and keeps three", () => {
    const { game, a } = table();
    spawn(game, "Kargan Warleader");
    spawn(game, "Attended Healer");
    lands(game, "Island", 1);
    lands(game, "Wastes", 4);
    let looked = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      looked = eligible.length;
      return eligible.slice(0, 3);
    };
    const plunder = toHand(game, "Skyclave Plunder");
    const before = hand(game).length;
    cast(game, plunder);
    expect(looked).toBe(5);
    expect(hand(game).length).toBe(before - 1 + 3);
  });
});

describe("Master of Winds", () => {
  it("may become 4/1 when you cast an instant, or stay as it is", () => {
    const { game, a } = table();
    const master = spawn(game, "Master of Winds");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Chilling Trap"), { targets: [ref(bears)] });
    expect(pt(game, master)).toEqual({ power: 4, toughness: 1 });
  });

  it("declining leaves it 1/4", () => {
    const { game, a } = table();
    const master = spawn(game, "Master of Winds");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    pickModes(a);
    cast(game, toHand(game, "Chilling Trap"), { targets: [ref(bears)] });
    expect(pt(game, master)).toEqual({ power: 1, toughness: 4 });
  });
});

describe("Shadows' Verdict", () => {
  it("exiles small creatures and planeswalkers from the battlefield and the graveyards", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const chandra = spawn(game, "Chandra, Acolyte of Flame", B);
    const stomper = spawn(game, "Kazandu Stomper", B);
    const deadBears = toGraveyard(game, "Grizzly Bears", B);
    const deadStomper = toGraveyard(game, "Kazandu Stomper");
    lands(game, "Swamp", 2);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Shadows' Verdict"));
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, chandra)).toBe("exile");
    expect(zone(game, stomper)).toBe("battlefield");
    expect(zone(game, deadBears)).toBe("exile");
    expect(zone(game, deadStomper)).toBe("graveyard");
  });
});

describe("Kazandu Stomper", () => {
  it("returns up to two of your lands to your hand", () => {
    const { game, a } = table();
    const [first, second, third] = lands(game, "Forest", 3);
    pickPermanents(a, first, second);
    enter(game, "Kazandu Stomper");
    expect(zone(game, first)).toBe("hand");
    expect(zone(game, second)).toBe("hand");
    expect(zone(game, third)).toBe("battlefield");
  });
});

describe("Drana's Silencer", () => {
  it("shrinks by the party size, itself counted", () => {
    const { game, a } = table();
    spawn(game, "Attended Healer");
    const stomper = spawn(game, "Kazandu Stomper", B);
    pickTargets(a, stomper);
    enter(game, "Drana's Silencer");
    expect(pt(game, stomper)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Expedition Healer", () => {
  it("has lifelink only with another Cleric", () => {
    const { game } = table();
    const healer = spawn(game, "Expedition Healer");
    expect(keywords(game, healer).has("lifelink")).toBe(false);
    spawn(game, "Attended Healer");
    expect(keywords(game, healer).has("lifelink")).toBe(true);
  });
});

describe("Synchronized Spellcraft", () => {
  it("deals 4 to the creature and the party size to its controller", () => {
    const { game } = table();
    spawn(game, "Attended Healer");
    spawn(game, "Kargan Warleader");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 4);
    cast(game, toHand(game, "Synchronized Spellcraft"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Coveted Prize", () => {
  it("costs {B} with a full party, tutors, and casts a cheap spell for free", () => {
    const { game, a } = table();
    fullParty(game);
    lands(game, "Swamp", 1);
    const target = toLibrary(game, "Kazandu Stomper");
    const bears = toHand(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => (eligible.includes(target) ? [target] : eligible.slice(0, 1));
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === bears);
      if (way === undefined) return null;
      return { type: "cast-spell", player: A, card: bears, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    cast(game, toHand(game, "Coveted Prize"));
    settle(game);
    expect(zone(game, target)).toBe("hand");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("offers no free cast without a full party", () => {
    const { game, a } = table();
    spawn(game, "Attended Healer");
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    let offered = false;
    a.chooseCastNowFn = () => {
      offered = true;
      return null;
    };
    cast(game, toHand(game, "Coveted Prize"));
    expect(offered).toBe(false);
  });
});

describe("The Destined Warrior", () => {
  it("makes party spells cost {1} less", () => {
    const { game } = table();
    spawn(game, "The Destined Warrior");
    lands(game, "Island", 1);
    const roilmage = toHand(game, "Tazeem Roilmage");
    cast(game, roilmage);
    expect(zone(game, roilmage)).toBe("battlefield");
  });

  it("gives +1/+0 at combat, +3/+0 with a full party", () => {
    const { game } = table();
    spawn(game, "The Destined Warrior");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "postcombat-main");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });

    const full = table();
    spawn(full.game, "The Destined Warrior");
    fullParty(full.game);
    const fullBears = spawn(full.game, "Grizzly Bears");
    toStep(full.game, "postcombat-main");
    expect(pt(full.game, fullBears)).toEqual({ power: 5, toughness: 2 });
  });
});
