/**
 * Set walk batch 84, part a (2026-10-15): Aetherdrift (DFT), Aetherdrift Commander (DRC) and Foundations (FDN), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
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
  nextTurn,
  pickFromZone,
  pickModes,
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
  types,
  zone,
} from "./harness.js";

/** Activate `source`'s ability `index`, tapping `tap` for its tap-others cost. */
function activateTapping(game: Game, source: ObjectId, index: number, tap: readonly ObjectId[]): void {
  const action = { type: "activate-ability", player: A, source, abilityIndex: index, targets: [], tap } as Action;
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
}

const canActivate = (game: Game, source: ObjectId, index: number): boolean =>
  game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === index);

describe("Quag Feast", () => {
  it("mills two, then destroys the permanent when its mana value is at most the cards in your graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Quag Feast"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    // Two milled Wastes, then the Feast itself.
    expect(graveyard(game).length).toBe(3);
  });

  it("counts after the mill but not itself — a mana value 3 creature survives an empty graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const courser = spawn(game, "Centaur Courser", B);
    cast(game, toHand(game, "Quag Feast"), { targets: [ref(courser)] });
    expect(zone(game, courser)).toBe("battlefield");
  });

  it("reaches a noncreature Vehicle", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Wastes");
    const wheel = spawn(game, "Big Wheel", B);
    cast(game, toHand(game, "Quag Feast"), { targets: [ref(wheel)] });
    expect(zone(game, wheel)).toBe("graveyard");
  });
});

describe("Boommobile", () => {
  it("adds four mana of one chosen colour that only pays for abilities — its exhaust, once", () => {
    const { game, a } = table();
    pickModes(a, 3); // red
    const boom = enter(game, "Boommobile");
    expect(game.state.players[A].manaPool.length).toBe(4);
    const bolt = toHand(game, "Lightning Bolt");
    expect(() => cast(game, bolt, { targets: [ref(B)] })).toThrow();
    activate(game, boom, 0, { targets: [ref(B)], x: 1 });
    expect(life(game, B)).toBe(19);
    expect(counters(game, boom)).toBe(1);
    lands(game, "Mountain", 4);
    expect(canActivate(game, boom, 0)).toBe(false);
  });
});

describe("Stall Out", () => {
  it("taps a creature and puts three stun counters on it", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Stall Out"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(3);
  });

  it("can target a Vehicle that isn't a creature", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const wheel = spawn(game, "Big Wheel", B);
    cast(game, toHand(game, "Stall Out"), { targets: [ref(wheel)] });
    expect(counters(game, wheel, "stun")).toBe(3);
  });
});

describe("Aetherjacket", () => {
  it("sacrifices itself to destroy another artifact, never itself", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const jacket = spawn(game, "Aetherjacket");
    const ring = spawn(game, "Sol Ring", B);
    expect(() => activate(game, jacket, 0, { targets: [ref(jacket)] })).toThrow();
    activate(game, jacket, 0, { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, jacket)).toBe("graveyard");
  });

  it("only as a sorcery", () => {
    const { game } = table({ step: "begin-combat" });
    lands(game, "Wastes", 2);
    const jacket = spawn(game, "Aetherjacket");
    spawn(game, "Sol Ring", B);
    expect(canActivate(game, jacket, 0)).toBe(false);
  });
});

describe("Ticket Tortoise", () => {
  it("makes a Treasure when an opponent controls more lands", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    lands(game, "Wastes", 2, B);
    enter(game, "Ticket Tortoise");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("makes nothing when no opponent has more", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    lands(game, "Wastes", 2, B);
    enter(game, "Ticket Tortoise");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("Run Over", () => {
  it("costs {1} less when it targets a Mount you control", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const jaguar = spawn(game, "Alacrian Jaguar");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Run Over"), { targets: [ref(jaguar), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    // One-sided: the Jaguar takes nothing back.
    expect(game.state.objects[jaguar].damageMarked).toBe(0);
  });

  it("costs full price otherwise", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Run Over"), { targets: [ref(bears), ref(theirs)] })).toThrow();
  });
});

describe("Voyager Glidecar", () => {
  it("scries 1 as it enters", () => {
    const { game, a } = table();
    const top = toLibrary(game, "Grizzly Bears");
    a.chooseScryFn = (_view, cards) => [...cards]; // to the bottom
    enter(game, "Voyager Glidecar");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[0]).not.toBe(top);
    expect(library[library.length - 1]).toBe(top);
  });

  it("tapping three other creatures makes it a flying artifact creature with a +1/+1 counter until end of turn", () => {
    const { game } = table();
    const car = spawn(game, "Voyager Glidecar");
    const crew = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    activateTapping(game, car, 0, crew);
    expect(types(game, car)).toContain("creature");
    expect(keywords(game, car).has("flying")).toBe(true);
    expect(pt(game, car)).toEqual({ power: 3, toughness: 4 });
    nextTurn(game);
    expect(types(game, car)).not.toContain("creature");
    expect(keywords(game, car).has("flying")).toBe(false);
    expect(counters(game, car)).toBe(1);
  });

  it("needs three creatures other than itself", () => {
    const { game } = table();
    const car = spawn(game, "Voyager Glidecar");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    expect(canActivate(game, car, 0)).toBe(false);
  });
});

describe("Earthrumbler", () => {
  it("exiles an artifact or creature card from your graveyard to become an artifact creature", () => {
    const { game } = table();
    const rumbler = spawn(game, "Earthrumbler");
    toGraveyard(game, "Wastes");
    expect(canActivate(game, rumbler, 0)).toBe(false);
    const ring = toGraveyard(game, "Sol Ring");
    activate(game, rumbler, 0);
    expect(zone(game, ring)).toBe("exile");
    expect(types(game, rumbler)).toContain("creature");
    expect(pt(game, rumbler)).toEqual({ power: 7, toughness: 6 });
  });
});

describe("Beastrider Vanguard", () => {
  it("looks at three and may take a permanent card, the rest to the bottom", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const vanguard = spawn(game, "Beastrider Vanguard");
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const ring = toLibrary(game, "Sol Ring");
    const seen = { offered: [] as readonly ObjectId[] };
    let asked = 0;
    // First the pick, then the order of the rest on the bottom.
    a.chooseFromZoneFn = (_view, eligible, min) => {
      if (asked++ === 0) {
        seen.offered = eligible;
        return [bears];
      }
      return eligible.slice(0, min);
    };
    activate(game, vanguard, 0);
    expect([...seen.offered].sort()).toEqual([bears, ring].sort());
    expect(zone(game, bears)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-2).sort()).toEqual([bolt, ring].sort());
  });
});

describe("Gastal Thrillroller", () => {
  it("is an artifact creature the turn it enters, and attacks at once", () => {
    const { game, a } = table();
    const roller = enter(game, "Gastal Thrillroller");
    expect(types(game, roller)).toContain("creature");
    attack(game, a, [roller]);
    expect(life(game, B)).toBe(16);
    nextTurn(game);
    expect(types(game, roller)).not.toContain("creature");
  });

  it("returns from your graveyard with a finality counter for {2}{R} and a discard, as a sorcery", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const roller = toGraveyard(game, "Gastal Thrillroller");
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    activate(game, roller, 1);
    expect(zone(game, roller)).toBe("battlefield");
    expect(counters(game, roller, "finality")).toBe(1);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(types(game, roller)).toContain("creature");
  });

  it("can't return outside your main phase", () => {
    const { game } = table({ step: "begin-combat" });
    lands(game, "Mountain", 3);
    const roller = toGraveyard(game, "Gastal Thrillroller");
    toHand(game, "Lightning Bolt");
    expect(canActivate(game, roller, 1)).toBe(false);
  });
});

describe("Carrion Cruiser", () => {
  it("mills two, then returns a creature or Vehicle card from your graveyard", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    const wheel = toGraveyard(game, "Big Wheel");
    toGraveyard(game, "Lightning Bolt");
    const seen = pickFromZone(a, wheel);
    enter(game, "Carrion Cruiser");
    expect([...seen.offered].sort()).toEqual([bears, wheel].sort());
    expect(zone(game, wheel)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Road Rage", () => {
  it("deals 2 plus the number of Mounts and Vehicles you control", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    spawn(game, "Alacrian Jaguar");
    spawn(game, "Big Wheel");
    spawn(game, "Big Wheel", B);
    // A 4/5: the opponent's Vehicle counted would make it 5, lethal.
    const gunner = spawn(game, "Thunderhead Gunner", B);
    cast(game, toHand(game, "Road Rage"), { targets: [ref(gunner)] });
    expect(game.state.objects[gunner].damageMarked).toBe(4);
  });
});

describe("Detention Chariot", () => {
  it("exiles an opponent's artifact or creature until it leaves", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const chariot = enter(game, "Detention Chariot");
    expect(zone(game, bears)).toBe("exile");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(chariot)]);
    settle(game);
    expect(zone(game, chariot)).toBe("graveyard");
    expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id].cardName === "Grizzly Bears")).toBe(true);
  });
});

describe("Spire Mechcycle", () => {
  it("taps another Vehicle to become an artifact creature for good, a counter per other Mount and Vehicle", () => {
    const { game } = table();
    const cycle = spawn(game, "Spire Mechcycle");
    const wheel = spawn(game, "Big Wheel");
    spawn(game, "Alacrian Jaguar");
    spawn(game, "Big Wheel", B);
    activateTapping(game, cycle, 0, [wheel]);
    expect(game.state.objects[wheel].tapped).toBe(true);
    expect(counters(game, cycle)).toBe(2);
    nextTurn(game);
    nextTurn(game);
    expect(types(game, cycle)).toContain("creature");
    expect(pt(game, cycle)).toEqual({ power: 7, toughness: 6 });
    expect(canActivate(game, cycle, 0)).toBe(false);
  });

  it("can't tap itself for the cost", () => {
    const { game } = table();
    const cycle = spawn(game, "Spire Mechcycle");
    expect(canActivate(game, cycle, 0)).toBe(false);
  });
});

describe("Pedal to the Metal", () => {
  it("gives +X/+0 and first strike", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Pedal to the Metal"), { targets: [ref(bears)], x: 3 });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
  });
});

describe("Thunderhead Gunner", () => {
  it("discards a card to draw a card, once each turn", () => {
    const { game, a } = table();
    const gunner = spawn(game, "Thunderhead Gunner");
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    const before = hand(game).length;
    activate(game, gunner, 0);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
    expect(canActivate(game, gunner, 0)).toBe(false);
  });

  it("only as a sorcery", () => {
    const { game } = table({ step: "begin-combat" });
    const gunner = spawn(game, "Thunderhead Gunner");
    toHand(game, "Lightning Bolt");
    expect(canActivate(game, gunner, 0)).toBe(false);
  });
});

describe("Winter, Cursed Rider", () => {
  it("gives artifacts you control ward—pay 2 life", () => {
    const { game, a } = table();
    spawn(game, "Winter, Cursed Rider", B);
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Mountain", 2);
    pickModes(a, 0); // pay the life
    cast(game, toHand(game, "Shatter"), { targets: [ref(ring)] });
    expect(life(game, A)).toBe(18);
    expect(zone(game, ring)).toBe("graveyard");
  });

  it("an unpaid ward counters the spell", () => {
    const { game, a } = table();
    spawn(game, "Winter, Cursed Rider", B);
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Mountain", 2);
    pickModes(a);
    cast(game, toHand(game, "Shatter"), { targets: [ref(ring)] });
    expect(life(game, A)).toBe(20);
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("exiles X artifact cards to give each other nonartifact creature -X/-X", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const winter = spawn(game, "Winter, Cursed Rider");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const thopter = spawn(game, "Ornithopter", B);
    const ring = toGraveyard(game, "Sol Ring");
    const ornithopter = toGraveyard(game, "Ornithopter");
    toGraveyard(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 2);
    activate(game, winter, 0, { x: 2 });
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, ornithopter)).toBe("exile");
    expect(zone(game, mine)).toBe("graveyard");
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    expect(zone(game, thopter)).toBe("battlefield");
    expect(zone(game, winter)).toBe("battlefield");
    expect(pt(game, winter)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Explosive Getaway", () => {
  it("exiles up to one artifact or creature, deals 4 to each creature, and returns it at the next end step", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Plains", 1);
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Explosive Getaway"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, theirs)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id].cardName === "Hill Giant")).toBe(true);
  });

  it("may exile nothing", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Plains", 1);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Explosive Getaway"), { targets: [null] });
    expect(zone(game, giant)).toBe("graveyard");
  });
});
