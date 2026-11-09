/**
 * An animate that sets creature characteristics: a granted P/T read live
 * (Myth Realized, Chimeric Mass, Svogthos, Beorn's Hospitality, Druid Class —
 * not a CDA once granted, rule 604.3a), replaced types and lost abilities (Oko,
 * Sparkshaper Visionary), a card type taken away for a while (Neurok Transmuter,
 * Blink's Alien Angel), and a card that is a creature off the battlefield alone
 * (Grist, the Hunger Tide).
 */
import { describe, expect, it } from "vitest";
import { canCommandAlone } from "../deck-validation.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  loyalty,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  types,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { GameState } from "../state.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const at = (game: Game, turn: number, step: GameState["turn"]["step"], player: PlayerId = A): void =>
  game.advanceUntil((s) => s.turn.number === turn && s.turn.step === step && s.priority.holder === player);

describe("a granted P/T, read live", () => {
  it("Myth Realized counts its lore counters as they change, until end of turn", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const myth = spawn(game, "Myth Realized");
    activate(game, myth, 0);
    expect(counters(game, myth, "lore")).toBe(1);
    activate(game, myth, 1);
    expect(types(game, myth)).toEqual(expect.arrayContaining(["enchantment", "creature"]));
    expect(subtypes(game, myth)).toEqual(expect.arrayContaining(["Monk", "Avatar"]));
    expect(pt(game, myth)).toEqual({ power: 1, toughness: 1 });
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 2 }, [ref(myth)]);
    expect(pt(game, myth)).toEqual({ power: 3, toughness: 3 });
    at(game, 2, "upkeep", B);
    expect(types(game, myth)).toEqual(["enchantment"]);
  });

  it("Chimeric Mass is as big as its charge counters, and an artifact the while", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const mass = toHand(game, "Chimeric Mass");
    cast(game, mass, { x: 3 });
    expect(counters(game, mass, "charge")).toBe(3);
    activate(game, mass, 0);
    expect(types(game, mass)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, mass)).toEqual({ power: 3, toughness: 3 });
  });

  it("is lost with its abilities: Humility-like loss takes the count away (rule 613.7)", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const myth = spawn(game, "Myth Realized");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 2 }, [ref(myth)]);
    activate(game, myth, 1);
    expect(pt(game, myth)).toEqual({ power: 2, toughness: 2 });
    game.debugApplyEffect(B, { kind: "become", loseAbilities: true, target: 0, duration: "end-of-turn" }, [ref(myth)]);
    expect(pt(game, myth)).toEqual({ power: 0, toughness: 0 });
  });

  it("Svogthos counts its controller's creature cards, in its own colors, still a land", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Forest", 2);
    const tomb = spawn(game, "Svogthos, the Restless Tomb");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears", B);
    activate(game, tomb, 1);
    expect(types(game, tomb)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, tomb)).toEqual({ power: 2, toughness: 2 });
    expect(game.characteristics(tomb).colors).toEqual(new Set(["B", "G"]));
    toGraveyard(game, "Grizzly Bears");
    expect(pt(game, tomb)).toEqual({ power: 3, toughness: 3 });
  });

  it("Beorn's Hospitality doesn't end, and grows with your lands", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    const beorn = spawn(game, "Beorn's Hospitality");
    activate(game, beorn, 0);
    expect(pt(game, beorn)).toEqual({ power: 7, toughness: 7 });
    at(game, 3, "precombat-main");
    expect(subtypes(game, beorn)).toContain("Bear");
    spawn(game, "Forest");
    expect(pt(game, beorn)).toEqual({ power: 8, toughness: 8 });
  });

  it("Druid Class's level 3 makes a land a hasty creature, and it stays one without the Class", () => {
    const { game, a } = table();
    lands(game, "Forest", 8);
    const target = spawn(game, "Forest");
    const druid = spawn(game, "Druid Class");
    enter(game, "Forest");
    expect(life(game)).toBe(21);
    activate(game, druid, 0);
    pickTargets(a, target);
    activate(game, druid, 1);
    expect(types(game, target)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(keywords(game, target).has("haste")).toBe(true);
    expect(pt(game, target)).toEqual({ power: 10, toughness: 10 });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(druid)]);
    settle(game);
    spawn(game, "Forest");
    expect(pt(game, target)).toEqual({ power: 11, toughness: 11 });
  });

  it("Druid Class's second land is level 2's alone", () => {
    const { game } = table();
    game.state.rules.maxLandsPerTurn = 1;
    lands(game, "Forest", 3);
    const druid = spawn(game, "Druid Class");
    const first = toHand(game, "Forest");
    const second = toHand(game, "Forest");
    const playLand = (card: ObjectId): void => {
      game.dispatch({ type: "play-land", player: A, card });
    };
    playLand(first);
    settle(game); // Its landfall.
    expect(game.legalActions(A).some((o) => o.kind === "play-land" && o.card === second)).toBe(false);
    activate(game, druid, 0);
    expect(game.legalActions(A).some((o) => o.kind === "play-land" && o.card === second)).toBe(true);
  });
});

describe("an animate with set types and lost abilities", () => {
  it("Oko's +1: a 3/3 green Elk with no abilities, no longer what it was, for good", () => {
    const { game } = table();
    const oko = spawn(game, "Oko, Thief of Crowns");
    const ring = spawn(game, "Sol Ring", B);
    loyalty(game, oko, 1, { targets: [ref(ring)] });
    expect(types(game, ring)).toEqual(["creature"]);
    expect(subtypes(game, ring)).toEqual(["Elk"]);
    expect(pt(game, ring)).toEqual({ power: 3, toughness: 3 });
    expect(game.characteristics(ring).colors).toEqual(new Set(["G"]));
    expect(game.legalActions(B).some((o) => o.kind === "activate-ability" && o.source === ring)).toBe(false);
    at(game, 3, "upkeep");
    expect(pt(game, ring)).toEqual({ power: 3, toughness: 3 });
  });

  it("Oko's +2 makes a Food", () => {
    const { game } = table();
    loyalty(game, spawn(game, "Oko, Thief of Crowns"), 2);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });

  it("Oko's -5 swaps a permanent for a creature of power 3 or less", () => {
    const { game } = table();
    const oko = spawn(game, "Oko, Thief of Crowns");
    const mine = spawn(game, "Sol Ring");
    const big = spawn(game, "Craw Wurm", B);
    const small = spawn(game, "Grizzly Bears", B);
    expect(() => loyalty(game, oko, -5, { atLeast: 6, targets: [ref(mine), ref(big)] })).toThrow();
    loyalty(game, oko, -5, { atLeast: 6, targets: [ref(mine), ref(small)] });
    expect(game.state.objects[mine].controller).toBe(B);
    expect(game.state.objects[small].controller).toBe(A);
  });

  it("Sparkshaper Visionary: any number of your planeswalkers, a 3/3 flying Bird for the turn", () => {
    const { game, a } = table();
    spawn(game, "Sparkshaper Visionary");
    const walker = spawn(game, "Garruk Wildspeaker");
    const other = spawn(game, "Oko, Thief of Crowns");
    pickTargets(a, walker);
    at(game, 1, "declare-attackers");
    expect(types(game, walker)).toEqual(["creature"]);
    expect(subtypes(game, walker)).toEqual(["Bird"]);
    expect(pt(game, walker)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, walker).has("flying")).toBe(true);
    expect(keywords(game, walker).has("hexproof")).toBe(true);
    expect(types(game, other)).toEqual(["planeswalker"]);
    at(game, 2, "upkeep", B);
    expect(types(game, walker)).toEqual(["planeswalker"]);
  });

  it("the Bird scries on combat damage, its loyalty abilities still there, its counters kept", () => {
    const { game, a } = table();
    spawn(game, "Sparkshaper Visionary");
    const walker = spawn(game, "Garruk Wildspeaker");
    const before = counters(game, walker, "loyalty");
    toLibrary(game, "Forest");
    pickTargets(a, walker);
    at(game, 1, "begin-combat");
    settle(game);
    expect(game.state.objects[walker].summoningSick).toBe(false);
    attack(game, a, [walker]);
    expect(life(game, B)).toBe(17);
    expect(counters(game, walker, "loyalty")).toBe(before);
    expect(zone(game, walker)).toBe("battlefield");
  });

  it("a planeswalker made a Bird can still activate its loyalty abilities", () => {
    const { game, a } = table();
    spawn(game, "Sparkshaper Visionary");
    const oko = spawn(game, "Oko, Thief of Crowns");
    pickTargets(a, oko);
    at(game, 1, "postcombat-main");
    expect(types(game, oko)).toEqual(["creature"]);
    loyalty(game, oko, 2);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(counters(game, oko, "loyalty")).toBe(6);
  });

  it("Sworn Defender reads its partner's P/T", () => {
    const { game, a, b } = table();
    lands(game, "Wastes", 2);
    const defender = spawn(game, "Sworn Defender");
    const wurm = spawn(game, "Craw Wurm", B);
    b.declareBlockersFn = () => [{ blocker: wurm, attacker: defender }];
    a.declareAttackersFn = () => [{ attacker: defender, defender: B }];
    at(game, 1, "declare-blockers");
    activate(game, defender, 0, { targets: [ref(wurm)] });
    expect(pt(game, defender)).toEqual({ power: 3, toughness: 7 });
  });

  it("Sworn Defender has no target out of combat", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const defender = spawn(game, "Sworn Defender");
    const wurm = spawn(game, "Craw Wurm", B);
    expect(() => activate(game, defender, 0, { targets: [ref(wurm)] })).toThrow();
  });
});

describe("a card type taken away for a while", () => {
  it("Neurok Transmuter adds artifact and takes it away, with its color", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const transmuter = spawn(game, "Neurok Transmuter");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, transmuter, 0, { targets: [ref(bears)] });
    expect(types(game, bears)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    const myr = spawn(game, "Ornithopter", B);
    activate(game, transmuter, 1, { targets: [ref(myr)] });
    expect(types(game, myr)).toEqual(["creature"]);
    expect(game.characteristics(myr).colors).toEqual(new Set(["U"]));
    at(game, 2, "upkeep", B);
    expect(types(game, myr)).toEqual(["artifact", "creature"]);
  });

  it("Blink's Alien Angel: an artifact until end of turn, its creature types gone, out of combat", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2, B);
    lands(game, "Forest", 2, B);
    const angel = spawn(game, "Alien Angel Token");
    expect(pt(game, angel)).toEqual({ power: 2, toughness: 2 });
    const bears = toHand(game, "Ambush Viper", B);
    a.declareAttackersFn = () => [{ attacker: angel, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === B);
    expect(game.state.objects[angel].attacking).not.toBeNull();
    cast(game, bears, { player: B, settle: false });
    settle(game);
    expect(types(game, angel)).toEqual(["artifact"]);
    expect(subtypes(game, angel)).toEqual([]);
    expect(game.state.objects[angel].attacking).toBeNull();
    at(game, 1, "postcombat-main");
    expect(life(game, B)).toBe(20);
    at(game, 2, "upkeep", B);
    expect(types(game, angel)).toEqual(expect.arrayContaining(["artifact", "creature"]));
  });

  it("Blink's I and III shuffle a creature away and its owner investigates", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const blink = toHand(game, "Blink");
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    cast(game, blink);
    expect(zone(game, bears)).toBe("library");
    expect(tokensNamed(game, "Clue Token", B)).toBe(1);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });
});

describe("a creature off the battlefield alone (Grist, the Hunger Tide)", () => {
  it("is a 1/1 Insect creature card everywhere else, a planeswalker on the battlefield", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 1);
    const inHand = toHand(game, "Grist, the Hunger Tide");
    expect(types(game, inHand)).toEqual(expect.arrayContaining(["planeswalker", "creature"]));
    expect(subtypes(game, inHand)).toEqual(expect.arrayContaining(["Grist", "Insect"]));
    expect(pt(game, inHand)).toEqual({ power: 1, toughness: 1 });
    cast(game, inHand, { settle: false });
    expect(zone(game, inHand)).toBe("stack");
    expect(types(game, inHand)).toContain("creature");
    settle(game);
    expect(zone(game, inHand)).toBe("battlefield");
    expect(types(game, inHand)).toEqual(["planeswalker"]);
    expect(subtypes(game, inHand)).toEqual(["Grist"]);
    expect(counters(game, inHand, "loyalty")).toBe(3);
  });

  it("is a creature card to what looks in the graveyard, and can be a commander", () => {
    const { game } = table();
    const grist = spawn(game, "Grist, the Hunger Tide");
    toGraveyard(game, "Grist, the Hunger Tide");
    toGraveyard(game, "Grizzly Bears");
    loyalty(game, grist, -5, { atLeast: 6 });
    expect(life(game, B)).toBe(18);
    expect(graveyard(game)).toHaveLength(2);
    expect(canCommandAlone(game.registry.get("Grist, the Hunger Tide")!)).toBe(true);
  });

  it("+1: a token and a mill, again for each Insect card, a loyalty counter each", () => {
    const { game } = table();
    const grist = spawn(game, "Grist, the Hunger Tide");
    const start = counters(game, grist, "loyalty");
    toLibrary(game, "Wastes");
    toLibrary(game, "Grist, the Hunger Tide");
    toLibrary(game, "Giant Mantis");
    loyalty(game, grist, 1);
    expect(tokensNamed(game, "Insect Token (Black-Green)", A)).toBe(3);
    expect(counters(game, grist, "loyalty")).toBe(start + 1 + 2);
  });

  it("-2: you may sacrifice a creature, and when you do, destroy a target", () => {
    const { game, a } = table();
    const grist = spawn(game, "Grist, the Hunger Tide");
    const fodder = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    pickModes(a, 0);
    pickTargets(a, wurm);
    loyalty(game, grist, -2);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("graveyard");
  });
});
