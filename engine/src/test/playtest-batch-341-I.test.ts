/**
 * Playtest cards, batch 341, group I — one focused test per card whose
 * behaviour is more than a stat line or an already-tested pattern.
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import { whyCannotBlock } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  life,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const pool = (game: Game) => game.state.players[A].manaPool;

function attackWith(game: Game, a: { declareAttackersFn?: unknown }, attacker: ObjectId): void {
  (a as { declareAttackersFn: () => unknown }).declareAttackersFn = () => [{ attacker, defender: B }];
  game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.awaiting?.kind === "blockers");
}

describe("Siege Elemental", () => {
  it("untapped creatures can't block, tapped ones can", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const untapped = spawn(game, "Grizzly Bears", B);
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Siege Elemental", A);
    attackWith(game, a, giant);
    expect(whyCannotBlock(game.state, game.registry, B, untapped, giant)).not.toBeNull();
    expect(whyCannotBlock(game.state, game.registry, B, tapped, giant)).toBeNull();
  });
});

describe("Famous Museum", () => {
  it("gets an art counter as a creature of yours dies, and taps for {C} plus one per counter", () => {
    const { game } = table();
    const museum = spawn(game, "Famous Museum");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    destroy(game, theirs);
    settle(game);
    expect(counters(game, museum, "art")).toBe(1);
    activate(game, museum, 0);
    expect(pool(game).filter((u) => u.type === "C")).toHaveLength(2);
  });
});

describe("Dairy Cow", () => {
  it("enters with five milk counters per Forest or Plant you control", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    spawn(game, "Wall of Roots"); // a Plant Wall
    lands(game, "Forest", 1, B);
    const cow = enter(game, "Dairy Cow");
    expect(counters(game, cow, "milk")).toBe(15);
  });
});

describe("Lander Rizzi", () => {
  it("makes X Landers, and each lander entering — itself among them — grows it", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const rizzi = toHand(game, "Lander Rizzi");
    cast(game, rizzi, { x: 2 });
    expect(tokensNamed(game, "Lander Token", A)).toBe(2);
    expect(counters(game, rizzi)).toBe(3);
    expect(pt(game, rizzi)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("The Keeper of the Yellow Hat", () => {
  it("can't be cast during your first seven turns; then makes a Yellow Hat worth +4/+4 and lifelink", () => {
    const { game } = table();
    lands(game, "Tundra", 4);
    const keeper = toHand(game, "The Keeper of the Yellow Hat");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: keeper, targets: [] })).not.toBeNull();
    game.state.players[A].turnsTaken = 8;
    invalidateComputedCache();
    cast(game, keeper);
    expect(zone(game, keeper)).toBe("battlefield");
    expect(tokensNamed(game, "Yellow Hat", A)).toBe(1);
    const hat = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Yellow Hat")!;
    activate(game, hat, 0, { targets: [ref(keeper)] });
    expect(pt(game, keeper)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, keeper).has("lifelink")).toBe(true);
  });
});

describe("The Marvelous Scientist", () => {
  it("Science: an instant or sorcery you cast deals 2 to each opponent", () => {
    const { game } = table();
    const scientist = spawn(game, "The Marvelous Scientist");
    game.state.objects[scientist].chosenOnEnter = "Science";
    invalidateComputedCache();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
  });

  it("Cosplay: a creature spell you cast sets its base P/T to that spell's mana value; Science is off", () => {
    const { game } = table();
    const scientist = spawn(game, "The Marvelous Scientist");
    game.state.objects[scientist].chosenOnEnter = "Cosplay";
    invalidateComputedCache();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Hill Giant")); // mana value 4
    expect(pt(game, scientist)).toEqual({ power: 4, toughness: 4 });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Spaghetti Junction", () => {
  it("at eight traffic counters it's sacrificed for Atlantakul", () => {
    const { game } = table();
    const junction = spawn(game, "Spaghetti Junction");
    game.state.objects[junction].counters.traffic = 8;
    invalidateComputedCache();
    enter(game, "Grizzly Bears"); // an event, so the state trigger is looked for
    expect(zone(game, junction)).toBe("graveyard");
    expect(tokensNamed(game, "Atlantakul", A)).toBe(1);
  });
});

describe("Black Tulip", () => {
  it("can't be activated before your sixth turn; then exiles itself for three mana of one color", () => {
    const { game } = table();
    const tulip = spawn(game, "Black Tulip");
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: tulip, abilityIndex: 0, targets: [] }),
    ).not.toBeNull();
    game.state.players[A].turnsTaken = 6;
    invalidateComputedCache();
    activate(game, tulip, 0);
    expect(zone(game, tulip)).toBe("exile");
    expect(pool(game)).toHaveLength(3);
    expect(new Set(pool(game).map((u) => u.type)).size).toBe(1);
  });
});

describe("Glorious Dragon-Kin", () => {
  it("gives your artifact creatures and Dragons protection from the chosen color, nothing else", () => {
    const { game } = table();
    const kin = spawn(game, "Glorious Dragon-Kin");
    game.state.objects[kin].chosenOnEnter = "R";
    const thopter = spawn(game, "Ornithopter");
    const dragon = spawn(game, "Shivan Dragon");
    const bears = spawn(game, "Grizzly Bears");
    const theirThopter = spawn(game, "Ornithopter", B);
    invalidateComputedCache();
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    const canBolt = (id: ObjectId) =>
      game.canDispatch({ type: "cast-spell", player: A, card: bolt, targets: [ref(id)] }) === null;
    expect(canBolt(kin)).toBe(false);
    expect(canBolt(thopter)).toBe(false);
    expect(canBolt(dragon)).toBe(false);
    expect(canBolt(bears)).toBe(true);
    expect(canBolt(theirThopter)).toBe(true);
  });
});

describe("Oilskelion", () => {
  it("enters with an oil counter per color of mana spent, and pings for one", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 3);
    const skelion = toHand(game, "Oilskelion");
    cast(game, skelion);
    expect(counters(game, skelion, "oil")).toBe(2);
    activate(game, skelion, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(counters(game, skelion, "oil")).toBe(1);
  });
});

describe("Command Mine", () => {
  it("adds one mana of the commander's colors without a Command Power Plant", () => {
    const { game } = table({ commanders: ["Niv-Mizzet, Parun"] });
    spawn(game, "Command Tower");
    const mine = spawn(game, "Command Mine");
    activate(game, mine, 0);
    expect(pool(game)).toHaveLength(1);
    expect(["U", "R"]).toContain(pool(game)[0].type);
  });
});

describe("Daxiver, Izzet Electromancer", () => {
  it("taps for mana spendable only on instants and sorceries", () => {
    const { game } = table();
    const daxiver = spawn(game, "Daxiver, Izzet Electromancer");
    activate(game, daxiver, 0);
    expect(pool(game)).toHaveLength(1);
    expect(pool(game)[0].restriction?.spell).toEqual({ typesAnyOf: ["instant", "sorcery"] });
  });
});

describe("Potatoes", () => {
  it("Mash makes two Food tokens", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const potatoes = spawn(game, "Potatoes");
    activate(game, potatoes, 0, { modes: [1] });
    expect(zone(game, potatoes)).toBe("graveyard");
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
  });
});

describe("The Belligerent and Useless Island", () => {
  it("enters tapped, a land that's an Island Vehicle", () => {
    const { game } = table();
    const island = enter(game, "The Belligerent and Useless Island");
    expect(game.state.objects[island].tapped).toBe(true);
  });
});

describe("Wowzer, the Aspirational", () => {
  it("wins as it attacks with everything in place, and not without the initiative", () => {
    const run = (withInitiative: boolean) => {
      const { game, a } = table();
      const wowzer = spawn(game, "Wowzer, the Aspirational");
      for (const token of ["Blood Token", "Clue Token", "Food Token", "Map Token", "Powerstone Token", "Treasure Token"]) {
        spawn(game, token);
      }
      game.state.players[A].energy = 1;
      game.state.players[A].citysBlessing = true;
      game.state.monarch = A;
      game.state.initiative = withInitiative ? A : null;
      invalidateComputedCache();
      attackWith(game, a, wowzer);
      settle(game);
      return game.state.result.winner === A;
    };
    expect(run(false)).toBe(false);
    expect(run(true)).toBe(true);
  });
});
