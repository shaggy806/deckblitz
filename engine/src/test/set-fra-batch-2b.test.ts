/**
 * Reality Fracture (FRA), batch 2, part b (2026-10-11): the set's next cards by EDHREC rank.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  pickFromZone,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

/** Empty `player`'s hand into exile, silently — a test board, not a discard. */
const emptyHand = (game: ReturnType<typeof table>["game"], player = A): void => {
  for (const id of [...hand(game, player)]) {
    game.state.zones.perPlayer[player].hand = game.state.zones.perPlayer[player].hand.filter((h) => h !== id);
    game.state.zones.shared.exile.push(id);
    game.state.objects[id].zone = "exile";
  }
};

describe("Innovative Commons", () => {
  it("enters tapped unless you control a planeswalker", () => {
    const { game } = table();
    const first = toHand(game, "Innovative Commons");
    game.dispatch({ type: "play-land", player: A, card: first });
    settle(game);
    expect(game.state.objects[first].tapped).toBe(true);
    spawn(game, "Jace Beleren");
    const second = toHand(game, "Innovative Commons");
    game.dispatch({ type: "play-land", player: A, card: second });
    settle(game);
    expect(game.state.objects[second].tapped).toBe(false);
  });
});

describe("Saheeli, Jewel of Avishkar", () => {
  it("makes a hasty Thopter for a noncreature spell, and none for a creature spell", () => {
    const { game } = table();
    spawn(game, "Saheeli, Jewel of Avishkar");
    lands(game, "Island", 1);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Opt"));
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
    const thopter = game.battlefield.find((id) => game.state.objects[id].cardName === "Thopter Token")!;
    expect(keywords(game, thopter).has("haste")).toBe(true);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
  });
});

describe("Garruk, Veiled Butcher", () => {
  it("−2: each player sacrifices; you get the trampling Beast, and the opponent's creature is exiled", () => {
    const { game } = table();
    const garruk = spawn(game, "Garruk, Veiled Butcher");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    loyalty(game, garruk, -2);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, "Beast Token (Garruk, Veiled Butcher)", A)).toBe(1);
    const beast = game.battlefield.find((id) => game.state.objects[id].cardName === "Beast Token (Garruk, Veiled Butcher)")!;
    expect(pt(game, beast)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, beast).has("trample")).toBe(true);
  });

  it("−2: no Beast when you had no creature to sacrifice", () => {
    const { game } = table();
    const garruk = spawn(game, "Garruk, Veiled Butcher");
    const giant = spawn(game, "Hill Giant", B);
    loyalty(game, garruk, -2);
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, "Beast Token (Garruk, Veiled Butcher)")).toBe(0);
  });

  it("−3: you draw for each opponent who didn't discard two nonland cards", () => {
    const { game } = table({ players: 3 });
    const garruk = spawn(game, "Garruk, Veiled Butcher");
    emptyHand(game, A);
    emptyHand(game, B);
    emptyHand(game, C);
    // Bob discards a land and a nonland card: he didn't discard two nonland cards.
    toHand(game, "Forest", B);
    toHand(game, "Lightning Bolt", B);
    // Carol discards two nonland cards.
    toHand(game, "Shock", C);
    toHand(game, "Lightning Bolt", C);
    loyalty(game, garruk, -3);
    expect(hand(game, B)).toHaveLength(0);
    expect(hand(game, C)).toHaveLength(0);
    expect(hand(game, A)).toHaveLength(1);
  });

  it("+2: the -4/-1 lasts until your next turn", () => {
    const { game } = table();
    const garruk = spawn(game, "Garruk, Veiled Butcher");
    const angel = spawn(game, "Serra Angel", B);
    loyalty(game, garruk, 2, { targets: [ref(angel)] });
    expect(pt(game, angel)).toEqual({ power: 0, toughness: 3 });
    toStep(game, "precombat-main", B);
    expect(pt(game, angel)).toEqual({ power: 0, toughness: 3 });
    toStep(game, "upkeep", A);
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Eye of Jace", () => {
  it("surveils, then at seven graveyard cards sacrifices itself, drains 2 and gains 2", () => {
    const { game, a } = table();
    const eye = spawn(game, "Eye of Jace");
    for (let i = 0; i < 6; i += 1) toGraveyard(game, "Wastes");
    const top = toLibrary(game, "Wastes");
    a.chooseScryFn = (_view, cards) => cards.filter((id) => id === top);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, top)).toBe("graveyard");
    expect(zone(game, eye)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("stays with only six cards in the graveyard after the surveil", () => {
    const { game, a } = table();
    const eye = spawn(game, "Eye of Jace");
    for (let i = 0; i < 6; i += 1) toGraveyard(game, "Wastes");
    a.chooseScryFn = () => [];
    toStep(game, "upkeep");
    settle(game);
    expect(graveyard(game)).toHaveLength(6);
    expect(zone(game, eye)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });
});

describe("Entrust the Spark", () => {
  it("sacrifices a planeswalker to put a planeswalker card from the library onto the battlefield", () => {
    const { game, a } = table();
    const jace = spawn(game, "Jace Beleren");
    const chandra = toLibrary(game, "Chandra, Torch of Defiance");
    lands(game, "Island", 3);
    lands(game, "Forest", 2);
    pickModes(a, 0);
    pickPermanents(a, jace);
    pickFromZone(a, chandra);
    cast(game, toHand(game, "Entrust the Spark"));
    expect(zone(game, jace)).toBe("graveyard");
    expect(zone(game, chandra)).toBe("battlefield");
  });

  it("searches nothing when no planeswalker was sacrificed", () => {
    const { game, a } = table();
    const chandra = toLibrary(game, "Chandra, Torch of Defiance");
    lands(game, "Island", 3);
    lands(game, "Forest", 2);
    pickModes(a, 0);
    let searched = false;
    a.chooseFromZoneFn = () => {
      searched = true;
      return [chandra];
    };
    cast(game, toHand(game, "Entrust the Spark"));
    expect(searched).toBe(false);
    expect(zone(game, chandra)).toBe("library");
  });
});

describe("Fblthp, Impossibly Lost", () => {
  it("draws two when an opponent is dealt combat damage on your turn, then shuffles into its owner's library", () => {
    const { game, a } = table();
    const fblthp = spawn(game, "Fblthp, Impossibly Lost");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(before + 2);
    expect(zone(game, fblthp)).toBe("library");
    expect(game.state.result.over).toBe(false);
  });

  it("wins when the draw empties the library — even a draw from an empty one", () => {
    const { game, a } = table();
    spawn(game, "Fblthp, Impossibly Lost");
    const bears = spawn(game, "Grizzly Bears");
    game.state.zones.perPlayer[A].library = game.state.zones.perPlayer[A].library.slice(0, 1);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.result.over || (s.turn.step === "postcombat-main" && s.priority.holder === A));
    expect(game.state.result).toMatchObject({ over: true, winner: A });
  });

  it("doesn't trigger when an opponent is dealt combat damage on someone else's turn", () => {
    const { game, b } = table({ players: 3 });
    const fblthp = spawn(game, "Fblthp, Impossibly Lost");
    const theirs = spawn(game, "Grizzly Bears", B);
    toStep(game, "precombat-main", B);
    const before = hand(game).length;
    // Bob's attacker hits Carol, one of alice's opponents — on Bob's turn.
    attack(game, b, [theirs], C);
    expect(life(game, C)).toBe(18);
    expect(hand(game).length).toBe(before);
    expect(zone(game, fblthp)).toBe("battlefield");
  });
});

describe("Multiply by Zero", () => {
  it("sets base power and toughness to 0/0; a +1/+1 counter still applies", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const plain = spawn(game, "Grizzly Bears", B);
    const grown = spawn(game, "Grizzly Bears", B);
    game.state.objects[grown].counters["+1/+1"] = 1;
    cast(game, toHand(game, "Multiply by Zero"), { targets: [ref(grown)] });
    expect(pt(game, grown)).toEqual({ power: 1, toughness: 1 });
    expect(counters(game, grown)).toBe(1);
    cast(game, toHand(game, "Multiply by Zero"), { targets: [ref(plain)] });
    expect(zone(game, plain)).toBe("graveyard");
  });
});

describe("Germinate Recruits", () => {
  it("creates a Cadet per life gained this turn, ignoring life lost", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3 });
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 });
    cast(game, toHand(game, "Germinate Recruits"));
    expect(life(game, A)).toBe(20);
    expect(tokensNamed(game, "Cadet", A)).toBe(3);
  });
});

describe("Konstrari Charm", () => {
  it("adds {C}{C}{C}", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Konstrari Charm"), { modes: [2] });
    const pool = game.state.players[A].manaPool;
    expect(pool).toHaveLength(3);
    expect(pool.every((unit) => unit.type === "C")).toBe(true);
  });

  it("deals 6 only to a creature with flying; or two counters and trample", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const charm = toHand(game, "Konstrari Charm");
    expect(() => cast(game, charm, { modes: [0], targets: [ref(bears)] })).toThrow();
    cast(game, charm, { modes: [0], targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Konstrari Charm"), { modes: [1], targets: [ref(mine)] });
    expect(pt(game, mine)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, mine).has("trample")).toBe(true);
  });
});

describe("Solarium Sentry", () => {
  it("gains 2 when an opponent casts a spell with mana value 2 or less", () => {
    const { game } = table();
    spawn(game, "Solarium Sentry");
    lands(game, "Forest", 2, B);
    lands(game, "Mountain", 4, B);
    toStep(game, "precombat-main", B);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    expect(life(game, A)).toBe(22);
    cast(game, toHand(game, "Hill Giant", B), { player: B });
    expect(life(game, A)).toBe(22);
  });
});

describe("Identity Echo", () => {
  it("exiles your creature and reveals until a creature or planeswalker card, which enters", () => {
    const { game } = table();
    const echo = spawn(game, "Identity Echo");
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const land = toLibrary(game, "Wastes");
    activate(game, echo, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("battlefield");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(land);
    // Not an opponent's creature.
    const theirs: ObjectId = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    expect(() => activate(game, echo, 0, { targets: [ref(theirs)] })).toThrow();
  });
});

describe("The Echoverse Fulcrum", () => {
  it("exiles itself to destroy all creatures, as a sorcery", () => {
    const { game } = table();
    const fulcrum = spawn(game, "The Echoverse Fulcrum");
    lands(game, "Wastes", 5);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    activate(game, fulcrum);
    expect(zone(game, fulcrum)).toBe("exile");
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });
});
