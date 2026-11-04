/**
 * The rest of a land's mana replaced as it's tapped (rules 106.12, 614.1a —
 * `land-mana-instead.test.ts` has Deep Water, Infernal Darkness, Reality
 * Twist): one mana whatever the amount (Contamination), a colour of the
 * tapper's choice (Pulse of Llanowar), every player's nonbasic lands for a
 * turn (Pale Moon), coloured mana only (Hall of Gemstone). And what "could
 * produce" reads through them (rule 106.7), and a land sacrificed for its mana.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ManaType } from "../mana.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, destroy, lands, nextTurn, pickModes, pickPermanents, spawn, table, toHand, toStep, zone } from "./harness.js";

const pool = (game: Game, player: PlayerId = A): string =>
  game.state.players[player].manaPool
    .map((u) => u.type)
    .sort()
    .join("");

type Activate = Extract<LegalAction, { kind: "activate-ability" }>;
const offers = (game: Game, source: ObjectId, player: PlayerId = A): Activate[] =>
  game.legalActions(player).filter((a): a is Activate => a.kind === "activate-ability" && a.source === source);

/** Taps `source` by hand with the offer picking `picks` (the first offer of
 * its ability `index`, without). */
const tapFor = (game: Game, source: ObjectId, player: PlayerId = A, picks?: readonly ManaType[], index = 0): void => {
  const all = offers(game, source, player).filter((o) => o.abilityIndex === index);
  const offer = picks === undefined ? all[0] : all.find((o) => o.manaColors?.join("") === picks.join(""));
  if (offer === undefined) throw new Error(`no such offer: ${JSON.stringify(all.map((o) => o.manaColors))}`);
  game.dispatch({
    type: "activate-ability",
    player,
    source,
    abilityIndex: offer.abilityIndex,
    targets: [],
    ...(offer.manaColors !== undefined ? { manaColors: offer.manaColors } : {}),
  });
};

describe("Contamination: one {B}, whatever the type and amount", () => {
  it("a Forest makes {B}, and a land that makes two makes one", () => {
    const { game } = table();
    spawn(game, "Contamination");
    const [forest] = lands(game, "Forest", 1);
    tapFor(game, forest);
    expect(pool(game)).toBe("B");
    const temple = spawn(game, "Temple of the False God");
    spawn(game, "Forest");
    spawn(game, "Forest");
    spawn(game, "Forest");
    spawn(game, "Forest");
    tapFor(game, temple);
    expect(pool(game)).toBe("BB");
  });

  it("paying a cost, each land is worth one {B}: a two-mana land pays only one pip", () => {
    const { game } = table();
    spawn(game, "Contamination");
    spawn(game, "Crystal Vein");
    const strix = toHand(game, "Baleful Strix");
    expect(() => cast(game, strix)).toThrow();
    expect(zone(game, strix)).toBe("hand");
  });

  it("a land its own cost sacrificed still makes one {B}, read as it last was", () => {
    const { game } = table();
    spawn(game, "Contamination");
    const vein = spawn(game, "Crystal Vein");
    tapFor(game, vein, A, undefined, 1);
    expect(zone(game, vein)).toBe("graveyard");
    expect(pool(game)).toBe("B");
  });

  it("what a triggered mana ability adds isn't the land's, and reads the {B} it made (the ruling)", () => {
    const { game } = table();
    spawn(game, "Contamination");
    spawn(game, "Mana Flare");
    const [forest] = lands(game, "Forest", 1);
    tapFor(game, forest);
    expect(pool(game)).toBe("BB");
  });

  it("the upkeep: sacrifice a creature to keep it, or it goes", () => {
    const { game, a } = table();
    const contamination = spawn(game, "Contamination");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickPermanents(a, bears);
    toStep(game, "draw");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, contamination)).toBe("battlefield");
    toStep(game, "draw");
    expect(zone(game, contamination)).toBe("graveyard");
  });
});

describe("Pale Moon: every player's nonbasic lands make {C} for the turn", () => {
  it("as much {C}, a basic land left alone, the opponent's too, and gone next turn", () => {
    const { game } = table();
    lands(game, "Island", 2);
    cast(game, toHand(game, "Pale Moon"));
    const temple = spawn(game, "Temple of the False God");
    lands(game, "Forest", 4);
    tapFor(game, temple);
    expect(pool(game)).toBe("CC");
    const [forest] = lands(game, "Forest", 1);
    tapFor(game, forest);
    expect(pool(game)).toBe("CCG");
    const tundra = spawn(game, "Tundra", B);
    expect(offers(game, tundra, B)).toEqual([]);
    game.state.players[B].manaPool.length = 0;
    nextTurn(game);
    tapFor(game, tundra, B, undefined, 0);
    expect(pool(game, B)).toBe("W");
  });

  it("while it lasts the opponent's dual taps for {C}, at instant speed", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const moon = toHand(game, "Pale Moon");
    const tundra = spawn(game, "Tundra", B);
    cast(game, moon);
    expect(zone(game, moon)).toBe("graveyard");
    // Bob has priority once Alice passes it.
    const offer = (): Activate[] => offers(game, tundra, B);
    game.dispatch({ type: "pass-priority", player: A });
    expect(offer().length).toBeGreaterThan(0);
    tapFor(game, tundra, B);
    expect(pool(game, B)).toBe("C");
  });
});

describe("Pulse of Llanowar: a basic land you control makes a colour of your choice", () => {
  it("chosen each tap, the same colour or another", () => {
    const { game } = table();
    spawn(game, "Pulse of Llanowar");
    const [one, two] = lands(game, "Forest", 2);
    expect(offers(game, one).map((o) => o.manaColors?.join(""))).toEqual(["W", "U", "B", "R", "G"]);
    tapFor(game, one, A, ["U"]);
    tapFor(game, two, A, ["G"]);
    expect(pool(game)).toBe("GU");
  });

  it("a pick that isn't a colour is the default, not {C}", () => {
    const { game } = table();
    spawn(game, "Pulse of Llanowar");
    const [forest] = lands(game, "Forest", 1);
    game.dispatch({ type: "activate-ability", player: A, source: forest, abilityIndex: 0, targets: [], manaColors: ["C"] });
    expect(pool(game)).toBe("W");
  });

  it("the payer picks the colour it needs: Forests pay for Baleful Strix", () => {
    const { game } = table();
    spawn(game, "Pulse of Llanowar");
    lands(game, "Forest", 2);
    const strix = toHand(game, "Baleful Strix");
    cast(game, strix);
    expect(zone(game, strix)).toBe("battlefield");
  });

  it("a nonbasic land, and an opponent's basic land, are left alone", () => {
    const { game } = table();
    spawn(game, "Pulse of Llanowar");
    const tundra = spawn(game, "Tundra");
    tapFor(game, tundra, A, undefined, 0);
    expect(pool(game)).toBe("W");
    nextTurn(game);
    const [mountain] = lands(game, "Mountain", 1, B);
    expect(offers(game, mountain, B)).toHaveLength(1);
    tapFor(game, mountain, B);
    expect(pool(game, B)).toBe("R");
  });

  it("the triggered mana a land sets off lines up with the pick", () => {
    const { game } = table();
    spawn(game, "Pulse of Llanowar");
    spawn(game, "Mana Flare");
    const [forest] = lands(game, "Forest", 1);
    tapFor(game, forest, A, ["R"]);
    expect(pool(game)).toBe("RR");
  });
});

describe("Harvest Mage: one mana of a colour of your choice, for the turn", () => {
  it("each land its controller taps makes one, whatever it would have made, and it ends with the turn", () => {
    const { game } = table();
    const mage = spawn(game, "Harvest Mage");
    lands(game, "Forest", 1);
    toHand(game, "Opt");
    activate(game, mage);
    const temple = spawn(game, "Temple of the False God");
    lands(game, "Forest", 4);
    expect(offers(game, temple).map((o) => o.manaColors?.join(""))).toEqual(["W", "U", "B", "R", "G"]);
    tapFor(game, temple, A, ["R"]);
    expect(pool(game)).toBe("R");
    nextTurn(game);
    nextTurn(game);
    expect(offers(game, temple)).toHaveLength(1);
  });

  it("only its controller's taps", () => {
    const { game } = table();
    const mage = spawn(game, "Harvest Mage");
    lands(game, "Forest", 1);
    toHand(game, "Opt");
    activate(game, mage);
    game.dispatch({ type: "pass-priority", player: A });
    const [island] = lands(game, "Island", 1, B);
    expect(offers(game, island, B)).toHaveLength(1);
    nextTurn(game);
    const [mountain] = lands(game, "Mountain", 1, B);
    expect(offers(game, mountain, B)).toHaveLength(1);
  });
});

describe("Hall of Gemstone: that player's colour, for every land, for the turn", () => {
  it("the active player chooses; coloured mana is that colour and {C} stays", () => {
    const { game, a, b } = table();
    spawn(game, "Hall of Gemstone");
    let asked = 0;
    b.chooseModesFn = () => {
      asked += 1;
      return [1];
    };
    a.chooseModesFn = () => {
      throw new Error("it isn't Alice's choice");
    };
    nextTurn(game);
    expect(asked).toBe(1);
    const [forest] = lands(game, "Forest", 1, B);
    tapFor(game, forest, B);
    expect(pool(game, B)).toBe("U");
    const wastes = spawn(game, "Wastes", B);
    tapFor(game, wastes, B);
    expect(pool(game, B)).toBe("CU");
    // Everyone's lands, not just the chooser's.
    const opposing = spawn(game, "Mountain", A);
    game.dispatch({ type: "pass-priority", player: B });
    tapFor(game, opposing, A);
    expect(pool(game, A)).toBe("U");
  });

  it("a new player chooses anew each upkeep", () => {
    const { game, a, b } = table();
    spawn(game, "Hall of Gemstone");
    b.chooseModesFn = () => [3];
    a.chooseModesFn = () => [0];
    nextTurn(game);
    const [forest] = lands(game, "Forest", 1, B);
    tapFor(game, forest, B);
    expect(pool(game, B)).toBe("R");
    nextTurn(game);
    const [island] = lands(game, "Island", 1, A);
    tapFor(game, island, A);
    expect(pool(game, A)).toBe("W");
  });

  it("the choice lasts the turn with the Hall gone, and none comes after", () => {
    const { game, a, b } = table();
    const hall = spawn(game, "Hall of Gemstone");
    b.chooseModesFn = () => [3];
    a.chooseModesFn = () => {
      throw new Error("no Hall, no choice");
    };
    nextTurn(game);
    destroy(game, hall);
    const [forest] = lands(game, "Forest", 1, B);
    tapFor(game, forest, B);
    expect(pool(game, B)).toBe("R");
    nextTurn(game);
    const [island] = lands(game, "Island", 1, A);
    tapFor(game, island, A);
    expect(pool(game, A)).toBe("U");
  });
});

describe("what a land could produce, through its replacement (rule 106.7)", () => {
  it("Fellwar Stone reads {B} off an opposing Forest under Infernal Darkness", () => {
    const { game } = table();
    spawn(game, "Infernal Darkness");
    spawn(game, "Forest", B);
    const stone = spawn(game, "Fellwar Stone");
    expect(offers(game, stone).map((o) => o.manaColors?.join(""))).toEqual(["B"]);
    tapFor(game, stone);
    expect(pool(game)).toBe("B");
  });

  it("every colour off a basic land under its controller's Pulse of Llanowar", () => {
    const { game } = table();
    spawn(game, "Pulse of Llanowar", B);
    spawn(game, "Forest", B);
    const stone = spawn(game, "Fellwar Stone");
    expect(offers(game, stone).map((o) => o.manaColors?.join(""))).toEqual(["W", "U", "B", "R", "G"]);
  });

  it("nothing off a land that makes no mana: nothing to replace (rule 106.5)", () => {
    const { game } = table();
    spawn(game, "Infernal Darkness");
    const orchard = spawn(game, "Exotic Orchard");
    tapFor(game, orchard);
    expect(pool(game)).toBe("");
  });
});
