/**
 * Set walk batch 86, part g (2026-10-15): Bloomburrow (BLB), Bloomburrow Commander (BLC), Mystery Booster 2 (MB2) and Assassin's Creed (ACR), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toHand,
  watchTargets,
  zone,
} from "./harness.js";

const ASSASSIN = "Assassin Token (Aya of Alexandria)";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const attachedTo = (game: Game, id: ObjectId): ObjectId | undefined => game.state.objects[id].attachedTo ?? undefined;

/** One real Assassin token for `player` (alice). */
function assassinToken(game: Game, player = A): ObjectId {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: ASSASSIN, count: 1 }, []);
  const made = game.battlefield.find((id) => !before.has(id));
  if (made === undefined) throw new Error("no Assassin token made");
  return made;
}

describe("Hookblade", () => {
  it("attaches as it enters; +1/+0, and flying only during its controller's turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const blade = enter(game, "Hookblade");
    expect(attachedTo(game, blade)).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
    expect(keywords(game, bears).has("flying")).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
  });

  it("equips for {2}", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const blade = spawn(game, "Hookblade");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, blade, 0, { targets: [ref(bears)] });
    expect(attachedTo(game, blade)).toBe(bears);
    expect(pt(game, bears).power).toBe(3);
  });
});

describe("Poison-Blade Mentor", () => {
  it("gives another Assassin you control deathtouch as it attacks — not itself, not a non-Assassin", () => {
    const { game, a } = table();
    const mentor = spawn(game, "Poison-Blade Mentor");
    const token = assassinToken(game);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, (offered) => offered.map((slot) => slot[0] ?? null));
    attack(game, a, [mentor]);
    // The token is the one legal target, so it's chosen without asking:
    // the Mentor (an Assassin itself) and the bears aren't offered.
    expect(seen.asked).toBe(0);
    expect(keywords(game, token).has("deathtouch")).toBe(true);
    expect(keywords(game, bears).has("deathtouch")).toBe(false);
  });
});

describe("Ezio, Brash Novice", () => {
  it("gets a +1/+1 counter as it attacks, and with two counters of any kind has first strike and is an Assassin", () => {
    const { game, a } = table();
    const ezio = spawn(game, "Ezio, Brash Novice");
    attack(game, a, [ezio]);
    expect(counters(game, ezio)).toBe(1);
    expect(keywords(game, ezio).has("first-strike")).toBe(false);
    expect(subtypes(game, ezio)).not.toContain("Assassin");
    // A second counter of another kind still makes two counters.
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "shield", amount: 1 }, [ref(ezio)]);
    expect(counters(game, ezio)).toBe(1);
    expect(keywords(game, ezio).has("first-strike")).toBe(true);
    expect(subtypes(game, ezio)).toEqual(expect.arrayContaining(["Human", "Assassin"]));
  });
});

describe("Tranquilize", () => {
  it("taps an opponent's creature and puts three stun counters on it", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Tranquilize"), { targets: [ref(bears)] });
    expect(isTapped(game, bears)).toBe(true);
    expect(counters(game, bears, "stun")).toBe(3);
  });

  it("can't target your own creature", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const mine = spawn(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Tranquilize"), { targets: [ref(mine)] })).toThrow();
  });
});

describe("Escarpment Fortress", () => {
  it("other creatures you control get +1/+0, and attacking with two or more draws a card", () => {
    const { game, a } = table();
    const fortress = spawn(game, "Escarpment Fortress");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, fortress)).toEqual({ power: 3, toughness: 5 });
    expect(pt(game, one)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    const before = hand(game).length;
    attack(game, a, [one, two]);
    expect(hand(game).length).toBe(before + 1);
  });

  it("attacking with one creature draws nothing", () => {
    const { game, a } = table();
    spawn(game, "Escarpment Fortress");
    const one = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [one]);
    expect(hand(game).length).toBe(before);
  });
});

describe("Raven Clan War-Axe", () => {
  it("offers its search as it enters, and the equipped creature gets +2/+0 and trample", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [];
    };
    const axe = toHand(game, "Raven Clan War-Axe");
    cast(game, axe);
    expect(zone(game, axe)).toBe("battlefield");
    expect(asked).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, axe, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Assassin Den", () => {
  it("puts a +1/+1 counter on a creature you control, which can't be blocked this turn", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const den = spawn(game, "Assassin Den");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, den, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    nextTurn(game);
    expect(keywords(game, bears).has("unblockable")).toBe(false);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Headsplitter", () => {
  it("makes a 1/1 menace Assassin as it enters and equips it", () => {
    const { game } = table();
    const splitter = enter(game, "Headsplitter");
    const host = attachedTo(game, splitter);
    expect(host).toBeDefined();
    expect(game.state.objects[host!].cardName).toBe(ASSASSIN);
    expect(pt(game, host!)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, host!).has("menace")).toBe(true);
  });
});

describe("Labyrinth Adversary", () => {
  it("whenever you attack, paying {1}{R} stops a target creature blocking — even when it isn't attacking itself", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Labyrinth Adversary");
    const attacker = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    const offer = blockOffer(game, a, [attacker]);
    const canBlock = (blocker: ObjectId): readonly ObjectId[] =>
      offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
    expect(canBlock(bears)).not.toContain(attacker);
    expect(canBlock(giant)).toContain(attacker);
  });

  it("does nothing when the {1}{R} isn't paid", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Labyrinth Adversary");
    const attacker = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    const offer = blockOffer(game, a, [attacker]);
    expect(offer.eligible.find((e) => e.blocker === bears)?.canBlock ?? []).toContain(attacker);
  });
});

describe("Misthios's Fury", () => {
  it("deals 3 to the creature, and 2 to its controller only if you control an Equipment", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Misthios's Fury"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    spawn(game, "Hookblade");
    const other = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Misthios's Fury"), { targets: [ref(other)] });
    expect(zone(game, other)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Hemlock Vial", () => {
  it("draws a card and loses 1 life as it enters", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Hemlock Vial");
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(19);
  });

  it("gives each equipped creature and Equipment you control deathtouch, fixed as it resolves", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    const vial = spawn(game, "Hemlock Vial");
    const equipped = spawn(game, "Grizzly Bears");
    const bare = spawn(game, "Grizzly Bears");
    const later = spawn(game, "Grizzly Bears");
    const blade = spawn(game, "Hookblade");
    const spare = spawn(game, "Raven Clan War-Axe");
    game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(equipped), ref(blade)]);
    expect(attachedTo(game, blade)).toBe(equipped);
    const theirs = spawn(game, "Grizzly Bears", B);
    const theirBlade = spawn(game, "Hookblade", B);
    game.debugApplyEffect(B, { kind: "attach", target: 0, attachment: 1 }, [ref(theirs), ref(theirBlade)]);
    expect(attachedTo(game, theirBlade)).toBe(theirs);
    activate(game, vial, 0);
    expect(zone(game, vial)).toBe("graveyard");
    expect(keywords(game, equipped).has("deathtouch")).toBe(true);
    expect(keywords(game, blade).has("deathtouch")).toBe(true);
    expect(keywords(game, spare).has("deathtouch")).toBe(true);
    expect(keywords(game, bare).has("deathtouch")).toBe(false);
    expect(keywords(game, theirs).has("deathtouch")).toBe(false);
    expect(keywords(game, theirBlade).has("deathtouch")).toBe(false);
    // Equipped afterwards: not among the creatures that gained it (the ruling).
    activate(game, spare, 0, { targets: [ref(later)] });
    expect(attachedTo(game, spare)).toBe(later);
    expect(keywords(game, later).has("deathtouch")).toBe(false);
  });
});

describe("Settlement Blacksmith", () => {
  it("draws a card as it enters only if you control an Equipment", () => {
    const { game } = table();
    const before = hand(game).length;
    spawn(game, "Hookblade", B);
    enter(game, "Settlement Blacksmith");
    expect(hand(game).length).toBe(before);
    spawn(game, "Hookblade");
    enter(game, "Settlement Blacksmith");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Keen-Eyed Raven", () => {
  it("puts a +1/+1 counter on another creature you control as it enters", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const raven = enter(game, "Keen-Eyed Raven");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, raven)).toBe(0);
  });
});
