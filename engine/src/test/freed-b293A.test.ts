/**
 * Batch B293, group A: the last of the freed queue. One test per card, on the
 * clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";
import {
  A,
  activate,
  attack,
  B,
  C,
  cast,
  controller,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  toStep,
  types,
  zone,
} from "./harness.js";

const colors = (game: Game, id: ObjectId): string[] => [...computeCharacteristics(game.state, registryOf(game), id).colors];

describe("Skin Invasion", () => {
  it("returns transformed under the Aura's controller's control when the creature dies", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    const aura = toHand(game, "Skin Invasion");
    cast(game, aura, { targets: [ref(bears)] });
    expect(zone(game, aura)).toBe("battlefield");
    destroy(game, bears);
    settle(game);
    expect(zone(game, aura)).toBe("battlefield");
    expect(controller(game, aura)).toBe(A);
    expect(types(game, aura)).toContain("creature");
    expect(pt(game, aura)).toEqual({ power: 3, toughness: 4 });
    expect(game.state.objects[aura].attachedTo ?? null).toBeNull();
  });
});

describe("Celestial Gatekeeper", () => {
  it("exiles itself and returns the other target; targeting itself, it stays exiled", () => {
    const { game, a } = table();
    const other = toGraveyard(game, "Celestial Gatekeeper");
    const gate = spawn(game, "Celestial Gatekeeper");
    a.chooseTargetsFn = () => [ref(gate), ref(other)];
    destroy(game, gate);
    settle(game);
    expect(zone(game, gate)).toBe("exile");
    expect(zone(game, other)).toBe("battlefield");
  });
});

describe("Human Torch", () => {
  it("gains its keywords only after a noncreature spell, and hits each other opponent only if paid", () => {
    const { game, a } = table({ players: 3 });
    const torch = spawn(game, "Human Torch");
    lands(game, "Mountain", 2);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    pickModes(a, 0);
    attack(game, a, [torch], B);
    expect(keywords(game, torch).has("double-strike")).toBe(true);
    // Double strike: two combat damage events of 3, each copied to Carol.
    expect(life(game, B)).toBe(20 - 2 - 3 - 3);
    expect(life(game, C)).toBe(20 - 3 - 3);
    expect(life(game, A)).toBe(20);
  });

  it("paying nothing, no other opponent is hit; no spell, no keywords", () => {
    const { game, a } = table({ players: 3 });
    const torch = spawn(game, "Human Torch");
    pickModes(a);
    attack(game, a, [torch], B);
    expect(keywords(game, torch).has("double-strike")).toBe(false);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(20);
  });
});

describe("Aphelia, Viper Whisperer", () => {
  it("halves each damaged player once, however many Snakes connect", () => {
    const { game, a } = table({ players: 3 });
    const aphelia = spawn(game, "Aphelia, Viper Whisperer");
    lands(game, "Swamp", 5);
    activate(game, aphelia, 0);
    const s1 = spawn(game, "Black Deathtouch Snake Token");
    const s2 = spawn(game, "Black Deathtouch Snake Token");
    const s3 = spawn(game, "Black Deathtouch Snake Token");
    a.declareAttackersFn = () => [
      { attacker: s1, defender: B },
      { attacker: s2, defender: B },
      { attacker: s3, defender: C },
    ];
    toStep(game, "postcombat-main", A);
    // Bob: 20 - 2 = 18, half rounded up 9, left 9. Carol: 20 - 1 = 19, half 10, left 9.
    expect(life(game, B)).toBe(9);
    expect(life(game, C)).toBe(9);
  });

  it("a non-Gorgon, non-Snake connecting doesn't trigger it", () => {
    const { game, a } = table();
    const aphelia = spawn(game, "Aphelia, Viper Whisperer");
    lands(game, "Swamp", 5);
    activate(game, aphelia, 0);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears], B);
    expect(life(game, B)).toBe(18);
  });
});

describe("Forth Eorlingas!", () => {
  it("makes X Knights and you the monarch once per combat damage event", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Mountain", 2);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Forth Eorlingas!"), { x: 1 });
    const [knight] = named(game, "Human Knight Token");
    expect(knight).toBeDefined();
    expect(keywords(game, knight).has("trample")).toBe(true);
    expect(keywords(game, knight).has("haste")).toBe(true);
    const bears = spawn(game, "Grizzly Bears");
    const seq = game.state.eventSeq;
    a.declareAttackersFn = () => [
      { attacker: knight, defender: B },
      { attacker: bears, defender: C },
    ];
    toStep(game, "postcombat-main", A);
    expect(game.state.monarch).toBe(A);
    const changes = game.state.eventLog.filter((e) => e.seq >= seq && e.type === "monarch-changed");
    expect(changes).toHaveLength(1);
  });
});

describe("Duskmantle Guildmage", () => {
  it("each activation loses that player 1 life for each card, and tokens don't count", () => {
    const { game } = table({ players: 3 });
    const mage = spawn(game, "Duskmantle Guildmage");
    lands(game, "Island", 5);
    lands(game, "Swamp", 5);
    activate(game, mage, 0);
    activate(game, mage, 0);
    activate(game, mage, 1, { targets: [ref(B)] });
    // Two activations, two cards: 4 life for Bob, none for Carol.
    expect(graveyard(game, B)).toHaveLength(2);
    expect(life(game, B)).toBe(16);
    expect(life(game, C)).toBe(20);
    const token = named(game, "Treasure Token");
    expect(token).toHaveLength(0);
    game.debugApplyEffect(B, { kind: "create-token", token: "Treasure Token", count: 1 });
    settle(game);
    const [treasure] = named(game, "Treasure Token");
    destroy(game, treasure);
    settle(game);
    expect(life(game, B)).toBe(16);
  });
});

describe("Over the Top", () => {
  it("each player's own count: permanents enter, the rest are in the graveyard", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 7);
    const bear = toLibrary(game, "Grizzly Bears", A);
    const shock = toLibrary(game, "Shock", A);
    const theirLand = toLibrary(game, "Wastes", B);
    const under = toLibrary(game, "Shock", B);
    // Bob controls one nonland permanent, so he reveals one card: the Shock on top.
    cast(game, toHand(game, "Over the Top"));
    expect(zone(game, bear)).toBe("battlefield");
    expect(zone(game, shock)).toBe("graveyard");
    expect(zone(game, under)).toBe("graveyard");
    expect(zone(game, theirLand)).toBe("library");
  });

  it("a revealed land is a permanent card and enters", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", A);
    lands(game, "Mountain", 7);
    const land = toLibrary(game, "Wastes", A);
    cast(game, toHand(game, "Over the Top"));
    expect(zone(game, land)).toBe("battlefield");
  });
});

describe("Eight-and-a-Half-Tails", () => {
  it("a spell made white enters white until end of turn", () => {
    const { game } = table();
    const tails = spawn(game, "Eight-and-a-Half-Tails");
    lands(game, "Plains", 3);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    activate(game, tails, 1, { targets: [ref(bears)], settle: false });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(colors(game, bears)).toEqual(["W"]);
    nextTurn(game);
    expect(colors(game, bears)).toEqual(["G"]);
  });

  it("gives a permanent you control protection from white until end of turn", () => {
    const { game } = table();
    const tails = spawn(game, "Eight-and-a-Half-Tails");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    activate(game, tails, 0, { targets: [ref(bears)] });
    const stop = game.canDispatch({ type: "activate-ability", player: A, source: tails, abilityIndex: 1, targets: [ref(bears)] });
    expect(stop ?? "").toMatch(/target|can't|illegal/i);
  });
});

describe("Ersatz Gnomes", () => {
  it("a spell made colorless stays colorless as a permanent, past end of turn", () => {
    const { game } = table();
    const gnomes = spawn(game, "Ersatz Gnomes");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    activate(game, gnomes, 0, { targets: [ref(bears)], settle: false });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(colors(game, bears)).toEqual([]);
    nextTurn(game);
    expect(colors(game, bears)).toEqual([]);
  });

  it("a permanent is colorless until end of turn", () => {
    const { game } = table();
    const gnomes = spawn(game, "Ersatz Gnomes");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, gnomes, 1, { targets: [ref(bears)] });
    expect(colors(game, bears)).toEqual([]);
    nextTurn(game);
    expect(colors(game, bears)).toEqual(["G"]);
  });
});

describe("Callidus Assassin", () => {
  it("enters tapped as a copy and may destroy another creature of its name, the source's name read as it last was", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    lands(game, "Swamp", 3);
    const assassin = toHand(game, "Callidus Assassin");
    pickFromZone(a, mine);
    pickTargets(a, theirs);
    cast(game, assassin, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.some((id) => s.objects[id]?.kind !== "card"));
    expect(zone(game, assassin)).toBe("battlefield");
    expect(game.state.objects[assassin].tapped).toBe(true);
    expect(nameOf(game.state.objects[assassin])).toBe("Grizzly Bears");
    // Killed in response: the trigger reads the name it last had (rule 608.2h).
    game.debugMove(assassin, "graveyard");
    settle(game);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("declining the copy, it's a 3/3 that enters untapped with no trigger", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    lands(game, "Swamp", 3);
    const assassin = toHand(game, "Callidus Assassin");
    a.chooseCopyFn = () => null;
    cast(game, assassin);
    expect(zone(game, assassin)).toBe("battlefield");
    expect(pt(game, assassin)).toEqual({ power: 3, toughness: 3 });
    expect(game.state.objects[assassin].tapped).toBe(false);
  });
});

describe("Evil Twin", () => {
  it("copies with the ability; it destroys a creature of the same name, the Twin included", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const twin = toHand(game, "Evil Twin");
    pickFromZone(a, mine);
    cast(game, twin);
    expect(pt(game, twin)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "precombat-main", A);
    activate(game, twin, 0, { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, twin)).toBe("battlefield");
  });
});

describe("Dragon Broodmother", () => {
  it("its token asks to devour as it's created and may devour Broodmother itself", () => {
    const { game, a } = table();
    const mother = spawn(game, "Dragon Broodmother");
    const bears = spawn(game, "Grizzly Bears");
    const seen = pickPermanents(a, bears);
    nextTurn(game, "upkeep");
    settle(game);
    expect(seen.offered).toContain(mother);
    expect(zone(game, bears)).toBe("graveyard");
    const dragons = game.battlefield.filter((id) => game.state.objects[id].cardName === "Dragon Token (Flying, Devour 2)");
    expect(dragons).toHaveLength(1);
    expect(game.state.objects[dragons[0]].isToken).toBe(true);
    expect(counters(game, dragons[0])).toBe(2);
    expect(colors(game, dragons[0]).slice().sort()).toEqual(["G", "R"]);
  });
});

describe("Acolyte of Bahamut", () => {
  it("each commander's copy reduces the first Dragon only, by {2} each", () => {
    const { game } = table();
    spawn(game, "Acolyte of Bahamut");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    game.state.objects[one].isCommander = true;
    game.state.objects[two].isCommander = true;
    lands(game, "Mountain", 2);
    const first = toHand(game, "Shivan Dragon");
    cast(game, first);
    expect(zone(game, first)).toBe("battlefield");
    // Spent: the second Dragon gets nothing off and there's nothing left.
    lands(game, "Mountain", 5);
    expect(() => cast(game, toHand(game, "Shivan Dragon"))).toThrow(/cannot pay|mana/i);
  });
});

describe("Gaddock Teeg", () => {
  const castsOf = (game: Game, card: ObjectId) =>
    game.legalActions(A).filter((x) => x.kind === "cast-spell" && x.card === card);

  it("stops noncreature MV 4+ and X spells, lets creatures and a split card's cheap half through", () => {
    const { game } = table();
    spawn(game, "Gaddock Teeg");
    lands(game, "Mountain", 4);
    lands(game, "Island", 2);
    lands(game, "Forest", 2);
    expect(castsOf(game, toHand(game, "Divination"))).toHaveLength(1);
    expect(castsOf(game, toHand(game, "Fireball"))).toHaveLength(0);
    expect(castsOf(game, toHand(game, "Prosperity"))).toHaveLength(0);
    expect(castsOf(game, toHand(game, "Hill Giant"))).toHaveLength(1);
    const split = castsOf(game, toHand(game, "Fire // Ice"));
    expect(split.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Decaying Soil", () => {
  it("exiles a card each upkeep", () => {
    const { game } = table();
    spawn(game, "Decaying Soil");
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Wastes");
    toStep(game, "upkeep", A);
    settle(game);
    expect(graveyard(game)).toHaveLength(1);
  });

  it("at threshold returns a dying creature for {1}; the seventh card doesn't count", () => {
    const { game, a } = table();
    spawn(game, "Decaying Soil");
    for (let i = 0; i < 6; i++) toGraveyard(game, "Wastes");
    lands(game, "Mountain", 2);
    pickModes(a, 0);
    const before = hand(game).length;
    destroy(game, spawn(game, "Grizzly Bears"));
    settle(game);
    // The bears make the seventh card, so the trigger was off (rule 603.10a).
    expect(hand(game).length).toBe(before);
    destroy(game, spawn(game, "Grizzly Bears"));
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(hand(game).some((id) => game.state.objects[id].cardName === "Grizzly Bears")).toBe(true);
  });
});

describe("Screeching Scorchbeast", () => {
  const scorch = (game: Game): void => {
    spawn(game, "Screeching Scorchbeast");
    toLibrary(game, "Shock", A);
    toLibrary(game, "Shock", B);
    toLibrary(game, "Shock", A);
    toLibrary(game, "Shock", B);
  };

  it("one simultaneous mill makes that many Zombie Mutants once, and only once a turn", () => {
    const { game, a } = table();
    scorch(game);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "mill", target: "each-player", amount: 1 });
    settle(game);
    expect(tokensNamed(game, "Zombie Mutant Token", A)).toBe(2);
    game.debugApplyEffect(A, { kind: "mill", target: "each-player", amount: 1 });
    settle(game);
    expect(tokensNamed(game, "Zombie Mutant Token", A)).toBe(2);
  });

  it("declined, it triggers again the next time", () => {
    const { game, a } = table();
    scorch(game);
    pickModes(a);
    game.debugApplyEffect(A, { kind: "mill", target: "each-player", amount: 1 });
    settle(game);
    expect(tokensNamed(game, "Zombie Mutant Token", A)).toBe(0);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "mill", target: "each-player", amount: 1 });
    settle(game);
    expect(tokensNamed(game, "Zombie Mutant Token", A)).toBe(2);
  });
});
