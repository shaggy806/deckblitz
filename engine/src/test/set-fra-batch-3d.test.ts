/**
 * Reality Fracture (FRA) and its Commander set (FRC), batch 3, part d
 * (2026-10-14): the bottom half of the set by EDHREC rank. Written on the
 * shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
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
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

/** What alice is offered for the first target of casting `card` or
 * activating `source`'s first ability, as object ids. */
const offered = (game: Game, id: ObjectId): readonly string[] => {
  const offer = game
    .legalActions(A)
    .find(
      (o) =>
        (o.kind === "cast-spell" && o.card === id) || (o.kind === "activate-ability" && o.source === id && o.abilityIndex === 0),
    );
  if (offer === undefined || !("targetOptions" in offer)) throw new Error(`nothing offered for ${id}`);
  return offer.targetOptions[0].map((t) => (t.kind === "object" ? t.object : t.player));
};

/** A planeswalker on the battlefield with `loyalty` loyalty counters. */
const walker = (game: Game, name: string, loyalty: number, player: PlayerId = A): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].counters.loyalty = loyalty;
  return id;
};

describe("Danitha, Sword of Hope", () => {
  it("draws for an Equipment spell, but only once each turn", () => {
    const { game } = table();
    spawn(game, "Danitha, Sword of Hope");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "Bonesplitter"));
    expect(hand(game)).toHaveLength(before + 1);
    // A spell targeting a creature you control would also draw — not twice a turn.
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("draws for a spell that targets a creature you control, not one an opponent controls", () => {
    const { game } = table();
    spawn(game, "Danitha, Sword of Hope");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(theirs)] });
    expect(hand(game)).toHaveLength(before);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Danitha, Spear of Agony", () => {
  it("gets a counter for a spell that targets an opponent or their creature, not you or yours", () => {
    const { game } = table();
    const danitha = spawn(game, "Danitha, Spear of Agony");
    const mine = spawn(game, "Colossal Dreadmaw");
    const theirs = spawn(game, "Colossal Dreadmaw", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(mine)] });
    expect(counters(game, danitha)).toBe(0);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, danitha)).toBe(1);
    cast(game, toHand(game, "Shock"), { targets: [ref(theirs)] });
    expect(counters(game, danitha)).toBe(2);
  });
});

describe("Compel Brutality", () => {
  it("has a planeswalker you control deal damage equal to its loyalty", () => {
    const { game } = table();
    const chandra = walker(game, "Chandra, Torch of Defiance", 4);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Compel Brutality"), { modes: [1], targets: [ref(chandra), ref(dreadmaw)] });
    expect(game.state.objects[dreadmaw].damageMarked).toBe(4);
    expect(counters(game, chandra, "loyalty")).toBe(4);
  });

  it("deals nothing once the planeswalker has left (the ruling)", () => {
    const { game } = table();
    const chandra = walker(game, "Chandra, Torch of Defiance", 4);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Compel Brutality"), {
      modes: [1],
      targets: [ref(chandra), ref(dreadmaw)],
      settle: false,
    });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(chandra)]);
    settle(game);
    expect(zone(game, chandra)).toBe("graveyard");
    expect(game.state.objects[dreadmaw].damageMarked).toBe(0);
  });
});

describe("Generous Revival", () => {
  it("returns a creature card with mana value 3 or less with an additional +1/+1 counter", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const dreadmaw = toGraveyard(game, "Colossal Dreadmaw");
    lands(game, "Plains", 3);
    const revival = toHand(game, "Generous Revival");
    expect(offered(game, revival)).toEqual([bears]);
    expect(offered(game, revival)).not.toContain(dreadmaw);
    cast(game, revival, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Solitary Cell", () => {
  it("exiles an opponent's nonland permanent with mana value 3 or less until it leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const ogre = spawn(game, "Gray Ogre", B);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    lands(game, "Plains", 1, B);
    spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [bears]);
    const cell = enter(game, "Solitary Cell");
    expect([...seen.offered[0]].sort()).toEqual([bears, ogre].sort());
    expect(zone(game, dreadmaw)).toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
    destroy(game, cell);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("discards only a legendary card to draw", () => {
    const { game } = table();
    const cell = spawn(game, "Solitary Cell");
    lands(game, "Plains", 2);
    // An opening hand of Wastes: nothing legendary to discard.
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: cell, abilityIndex: 0, targets: [] }),
    ).not.toBeNull();
    const danitha = toHand(game, "Danitha, Sword of Hope");
    const before = hand(game).length;
    activate(game, cell, 0);
    expect(zone(game, danitha)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before);
  });
});

describe("Rescue Girl, First Responder", () => {
  it("returns another permanent you control, never itself or an opponent's", () => {
    const { game } = table();
    const girl = spawn(game, "Rescue Girl, First Responder");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const options = offered(game, girl);
    expect(options).toContain(bears);
    expect(options).not.toContain(girl);
    expect(options).not.toContain(theirs);
    activate(game, girl, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Break Under Pressure", () => {
  it("has the opponent sacrifice the greatest mana value among creatures and planeswalkers", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const chandra = walker(game, "Chandra, Torch of Defiance", 4, B);
    const memorial = spawn(game, "Akroma's Memorial", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Break Under Pressure"), { targets: [ref(B)] });
    expect(zone(game, chandra)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, memorial)).toBe("battlefield");
    expect(life(game)).toBe(22);
  });
});

describe("Fulminous Forte", () => {
  it("deals 1 damage to each creature and planeswalker your opponents control", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const chandra = walker(game, "Chandra, Torch of Defiance", 4, B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Fulminous Forte"), { modes: [0] });
    expect(game.state.objects[mine].damageMarked).toBe(0);
    expect(game.state.objects[theirs].damageMarked).toBe(1);
    expect(counters(game, chandra, "loyalty")).toBe(3);
    expect(life(game, B)).toBe(20);
  });
});

describe("Semester Foreseer", () => {
  it("enters prepared with Peer Review, whose copy makes a Cadet", () => {
    const { game } = table();
    // A silent spawn enters prepared too (its own replacement), with no
    // surveil trigger to settle.
    const foreseer = spawn(game, "Semester Foreseer");
    const copy = game.state.objects[foreseer].prepared?.copy;
    expect(copy).toBeDefined();
    expect(game.state.objects[copy!].cardName).toBe("Peer Review");
    lands(game, "Plains", 3);
    cast(game, copy!, { via: "prepared" });
    expect(tokensNamed(game, "Cadet", A)).toBe(1);
    expect(game.state.objects[foreseer].prepared).toBeUndefined();
  });
});

describe("Theorix Metamage", () => {
  it("mills three with Omit Variables, and has +1/+0 and flying at threshold", () => {
    const { game } = table();
    const metamage = enter(game, "Theorix Metamage");
    expect(pt(game, metamage)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, metamage).has("flying")).toBe(false);
    const copy = game.state.objects[metamage].prepared!.copy;
    expect(game.state.objects[copy].cardName).toBe("Omit Variables");
    lands(game, "Island", 1);
    cast(game, copy, { via: "prepared" });
    // Three milled, and the copy itself ceases to exist rather than going there.
    expect(graveyard(game)).toHaveLength(3);
    for (let i = 0; i < 3; i++) toGraveyard(game, "Wastes");
    expect(keywords(game, metamage).has("flying")).toBe(false);
    toGraveyard(game, "Wastes");
    expect(pt(game, metamage)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, metamage).has("flying")).toBe(true);
  });
});

describe("Budding Insurgent", () => {
  it("draws only when the destroyed permanent was a legendary enchantment", () => {
    for (const [name, draws] of [
      ["Agent of the Iron Throne", 1],
      ["Akroma's Memorial", 0],
      ["Glorious Anthem", 0],
    ] as const) {
      const { game } = table();
      const insurgent = spawn(game, "Budding Insurgent");
      const target = spawn(game, name, B);
      const before = hand(game).length;
      activate(game, insurgent, 0, { targets: [ref(target)] });
      expect(zone(game, target), name).toBe("graveyard");
      expect(hand(game), name).toHaveLength(before + draws);
    }
  });
});

describe("Graft Surgeon", () => {
  it("enters with a +1/+1 counter and puts its counters on up to one creature you control as it dies", () => {
    const { game, a } = table();
    const surgeon = enter(game, "Graft Surgeon");
    expect(counters(game, surgeon)).toBe(1);
    game.state.objects[surgeon].counters["+1/+1"] = 3;
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    destroy(game, surgeon);
    expect(counters(game, bears)).toBe(3);
  });
});

describe("Theoretical Necromancer", () => {
  it("exiles itself from your graveyard to return another creature card, never itself", () => {
    const { game } = table();
    const necromancer = toGraveyard(game, "Theoretical Necromancer");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    expect(offered(game, necromancer)).toEqual([bears]);
    activate(game, necromancer, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, necromancer)).toBe("exile");
  });
});

describe("Cryotheory Adept", () => {
  it("exiles itself from your graveyard to tap a creature and stun it", () => {
    const { game } = table();
    const adept = toGraveyard(game, "Cryotheory Adept");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    activate(game, adept, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
    expect(zone(game, adept)).toBe("exile");
  });
});
