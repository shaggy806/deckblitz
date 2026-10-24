import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  toStep,
  types,
  zone,
} from "./harness.js";

// Oath of the Gatewatch / Commander 2015, group D.

const equip = (game: Game, equipment: ObjectId, creature: ObjectId): void => {
  spawn(game, "Wastes");
  game.dispatch({ type: "activate-ability", player: A, source: equipment, abilityIndex: 0, targets: [ref(creature)] });
  game.advanceUntil(quiet);
  expect(game.state.objects[equipment].attachedTo).toBe(creature);
};

describe("Oath of Jace", () => {
  it("scries X at upkeep for X planeswalkers, and doesn't scry at all with none", () => {
    const { game, a } = table();
    spawn(game, "Oath of Jace");
    let scried = -1;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    toStep(game, "upkeep");
    game.advanceUntil(quiet);
    expect(scried).toBe(-1);
    spawn(game, "Jace Beleren");
    toStep(game, "upkeep");
    game.advanceUntil(quiet);
    expect(scried).toBe(1);
  });
});

describe("Sylvan Advocate and Wall of Resurgence", () => {
  it("six lands pump the Advocate and a land creature the Wall made", () => {
    const { game, a } = table();
    const forests = lands(game, "Forest", 5);
    const advocate = spawn(game, "Sylvan Advocate");
    expect(pt(game, advocate)).toEqual({ power: 2, toughness: 3 });
    pickTargets(a, forests[0]);
    pickModes(a, 0);
    enter(game, "Wall of Resurgence");
    expect(types(game, forests[0])).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(keywords(game, forests[0]).has("haste")).toBe(true);
    expect(pt(game, forests[0])).toEqual({ power: 3, toughness: 3 });
    spawn(game, "Forest");
    expect(pt(game, advocate)).toEqual({ power: 4, toughness: 5 });
    expect(pt(game, forests[0])).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Eldrazi Mimic", () => {
  it("may take the entering colorless creature's power and toughness until end of turn", () => {
    const { game, a } = table();
    const mimic = spawn(game, "Eldrazi Mimic");
    pickModes(a, 0);
    enter(game, "Ulamog's Crusher");
    expect(pt(game, mimic)).toEqual({ power: 8, toughness: 8 });
    nextTurn(game);
    expect(pt(game, mimic)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Flayer Drone", () => {
  it("another colorless creature entering makes the target opponent lose 1 life; a green one doesn't", () => {
    const { game, a } = table();
    spawn(game, "Flayer Drone");
    pickTargets(a, B);
    enter(game, "Grizzly Bears");
    expect(life(game, B)).toBe(20);
    enter(game, "Memnite");
    expect(life(game, B)).toBe(19);
  });
});

describe("Stone Haven Outfitter", () => {
  it("pumps equipped creatures and draws when one dies, not when an unequipped one does", () => {
    const { game } = table();
    spawn(game, "Stone Haven Outfitter");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const splitter = spawn(game, "Bonesplitter");
    equip(game, splitter, bears);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 3 });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    const before = hand(game).length;
    destroy(game, giant);
    expect(hand(game).length).toBe(before);
    destroy(game, bears);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Reckless Bushwhacker", () => {
  it("cast for its surge cost, other creatures get +1/+0 and haste", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    const bushwhacker = toHand(game, "Reckless Bushwhacker");
    cast(game, bushwhacker, { altCost: true });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(pt(game, bushwhacker)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Eldrazi Obligator and Bearer of Silence", () => {
  it("Obligator: paying {1}{C} as it's cast steals, untaps and hastes the target", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    // Enough Wastes that the {1}{C} is payable whatever paid for the spell.
    lands(game, "Wastes", 4);
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    pickTargets(a, giant);
    pickModes(a, 0);
    cast(game, toHand(game, "Eldrazi Obligator"));
    expect(controller(game, giant)).toBe(A);
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(keywords(game, giant).has("haste")).toBe(true);
  });

  it("Bearer: paying {1}{C} makes the target opponent sacrifice a creature", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B);
    pickModes(a, 0);
    cast(game, toHand(game, "Bearer of Silence"));
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Searing Light", () => {
  it("only an attacking or blocking creature with power 2 or less", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const light = toHand(game, "Searing Light");
    expect(() => cast(game, light, { targets: [ref(bears)], settle: false })).toThrow(/refused/);
    a.declareAttackersFn = () => [bears, giant].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && quiet(s));
    expect(() => cast(game, light, { targets: [ref(giant)], settle: false })).toThrow(/refused/);
    cast(game, light, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Support", () => {
  it("Joraga Auxiliary: other target creatures only", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    lands(game, "Plains", 1);
    const joraga = spawn(game, "Joraga Auxiliary");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, joraga, 0, { targets: [ref(joraga), null], settle: false })).toThrow(/refused/);
    activate(game, joraga, 0, { targets: [ref(bears), null] });
    expect(game.state.objects[bears].counters["+1/+1"]).toBe(1);
  });

  it("Lead by Example: up to two target creatures, its caster's own included", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Lead by Example"), { targets: [ref(mine), ref(theirs)] });
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Daxos the Returned", () => {
  it("an enchantment spell gives an experience counter; its Spirit is */* by them", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    lands(game, "Swamp", 2);
    lands(game, "Wastes", 2);
    const daxos = spawn(game, "Daxos the Returned");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    cast(game, toHand(game, "Pacifism"), { targets: [ref(bears)] });
    expect(game.state.players[A].counters.experience).toBe(1);
    activate(game, daxos);
    const spirit = game.battlefield.find((id) => game.state.objects[id].cardName === "Spirit Token (Experience Counters)");
    expect(spirit).toBeDefined();
    expect(pt(game, spirit!)).toEqual({ power: 1, toughness: 1 });
    expect(types(game, spirit!)).toEqual(expect.arrayContaining(["enchantment", "creature"]));
  });
});

describe("Daxos's Torment", () => {
  it("another enchantment entering makes it a 5/5 flying, hasty Demon that's still an enchantment", () => {
    const { game } = table();
    const torment = spawn(game, "Daxos's Torment");
    enter(game, "Glorious Anthem");
    expect(types(game, torment)).toEqual(expect.arrayContaining(["enchantment", "creature"]));
    // Glorious Anthem's +1/+1 applies to it as a creature.
    expect(pt(game, torment)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, torment).has("flying")).toBe(true);
    expect(keywords(game, torment).has("haste")).toBe(true);
    nextTurn(game);
    expect(types(game, torment)).not.toContain("creature");
  });
});

describe("Awaken the Sky Tyrant", () => {
  it("an opponent's source damaging you sacrifices it for a 5/5 Dragon", () => {
    const { game } = table();
    const awaken = spawn(game, "Awaken the Sky Tyrant");
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(zone(game, awaken)).toBe("graveyard");
    expect(tokensNamed(game, "Dragon Token", A)).toBe(1);
  });
});

describe("Gnashing of Teeth", () => {
  it("first mode: -5/-5, and the creature that dies is exiled", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Gnashing of Teeth"), { modes: [0], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
  });

  it("second mode: creatures the target player controls get -1/-1", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const mine = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Gnashing of Teeth"), { modes: [1], targets: [ref(B)] });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Wilt in the Heat", () => {
  it("costs {2} less once a card has left your graveyard this turn (Null Caller's cost), and exiles what it kills", () => {
    const first = table().game;
    lands(first, "Mountain", 1);
    lands(first, "Plains", 1);
    const target = spawn(first, "Hill Giant", B);
    expect(() => cast(first, toHand(first, "Wilt in the Heat"), { targets: [ref(target)], settle: false })).toThrow(
      /refused/,
    );

    const { game } = table();
    const caller = spawn(game, "Null Caller");
    lands(game, "Swamp", 4);
    toGraveyard(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, caller);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Wilt in the Heat"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
  });
});
