import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { A, activate, graveyard, hand, spawn, table, toHand, zone } from "./harness.js";

/** Skirge Familiar's "Discard a card: Add {B}". */
const familiar = defineCard({
  name: "Gap Test Discard Familiar",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 3,
  toughness: 2,
  text: "Discard a card: Add {B}.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "Discard a card: Add {B}.",
    },
  ],
});

const newTable = () => table({ registry: createDefaultRegistry().register(familiar) });
const pool = (game: Game): readonly string[] => game.state.players[A].manaPool.map((unit) => unit.type);

/** A mana ability's whole cost is paid before its mana comes (rules 602.2b, 605.3b). */
describe("a mana ability with a discard cost", () => {
  it("asks which card, adds the mana once it's paid, and hands priority back", () => {
    const { game } = newTable();
    const imp = spawn(game, familiar.name);
    const first = toHand(game, "Grizzly Bears");
    toHand(game, "Forest");
    const before = hand(game).length;
    activate(game, imp, 0, { settle: false });
    expect(game.state.awaiting?.kind).toBe("discard");
    expect(pool(game)).toEqual([]);
    game.dispatch({ type: "discard", player: A, cards: [first] });
    expect(zone(game, first)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before - 1);
    expect(pool(game)).toEqual(["B"]);
    expect(game.state.awaiting).toBeNull();
    expect(game.state.priority.holder).toBe(A);
  });

  it("with a one-card hand there's nothing to ask", () => {
    const { game } = table({ registry: createDefaultRegistry().register(familiar), openingHandSize: 0 });
    const imp = spawn(game, familiar.name);
    expect(hand(game)).toHaveLength(1); // The turn's draw.
    const yard = graveyard(game).length;
    activate(game, imp, 0);
    expect(hand(game)).toHaveLength(0);
    expect(graveyard(game)).toHaveLength(yard + 1);
    expect(pool(game)).toEqual(["B"]);
  });

  it("with no card in hand it can't be activated", () => {
    const { game } = table({ registry: createDefaultRegistry().register(familiar), openingHandSize: 0 });
    const imp = spawn(game, familiar.name);
    for (const id of [...hand(game)]) game.debugMove(id, "graveyard");
    expect(hand(game)).toHaveLength(0);
    expect(game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === imp)).toBe(false);
  });
});
