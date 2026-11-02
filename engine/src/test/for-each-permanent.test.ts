/**
 * `for-each-permanent`: an effect that names one object, done to every permanent a
 * filter matches, nobody choosing. Each is bound to a target slot in turn, a token
 * stack is woken first (rule 700.3b), and what's gone by its turn is skipped (400.7).
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { matchesFilter } from "../filter.js";
import { Game } from "../game.js";
import type { PlayerId, ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  enter,
  keywords,
  lands,
  life,
  named,
  pt,
  ref,
  registryOf,
  spawn,
  subtypes,
  table,
  toHand,
  types,
  zone,
} from "./harness.js";

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

/** Real tokens, made the way a card makes them: eight or more compact into one stack. */
function stackOf(game: Game, name: string, player: PlayerId, count: number): ObjectId {
  game.debugApplyEffect(player, { kind: "create-token", token: name, count });
  const stack = game.state.zones.shared.battlefield.find(
    (id) => game.state.objects[id].cardName === name && game.state.objects[id].isToken,
  );
  if (stack === undefined || (game.state.objects[stack].stackCount ?? 1) !== count) {
    throw new Error(`expected one stack of ${count} ${name}`);
  }
  return stack;
}

describe("Thundermare: tap all other creatures", () => {
  it("taps everyone else's and yours, not itself, and asks nobody", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Serra Angel", B);
    const land = spawn(game, "Forest");
    a.choosePermanentsFn = () => {
      throw new Error("nobody should be asked");
    };
    const mare = enter(game, "Thundermare");
    expect(tapped(game, mine)).toBe(true);
    expect(tapped(game, theirs)).toBe(true);
    expect(tapped(game, land)).toBe(false);
    expect(tapped(game, mare)).toBe(false);
  });

  it("reaches every token of a stack", () => {
    const { game } = table();
    stackOf(game, "Saproling Token", B, 12);
    enter(game, "Thundermare");
    const saprolings = named(game, "Saproling Token", B);
    const count = saprolings.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
    expect(count).toBe(12);
    for (const id of saprolings) expect(tapped(game, id)).toBe(true);
  });
});

describe("Disarm: a filter reading the spell's target, then each match bound to slot 0", () => {
  it("unattaches all Equipment from the target, and only from it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Serra Angel");
    const one = spawn(game, "Bonesplitter");
    const two = spawn(game, "Short Sword");
    const three = spawn(game, "Bonesplitter");
    game.state.objects[one].attachedTo = bears;
    game.state.objects[two].attachedTo = bears;
    game.state.objects[three].attachedTo = other;
    lands(game, "Island", 1);
    cast(game, toHand(game, "Disarm"), { targets: [ref(bears)] });
    expect(game.state.objects[one].attachedTo).toBeNull();
    expect(game.state.objects[two].attachedTo).toBeNull();
    expect(game.state.objects[three].attachedTo).toBe(other);
    expect(zone(game, one)).toBe("battlefield");
  });
});

describe("Baki's Curse: an amount read per permanent", () => {
  it("deals 2 damage for each Aura on that creature, to each creature", () => {
    const { game } = table();
    const twice = spawn(game, "Serra Angel");
    const once = spawn(game, "Serra Angel", B);
    const none = spawn(game, "Serra Angel", B);
    for (const [aura, on] of [
      ["Pacifism", twice],
      ["Pacifism", twice],
      ["Pacifism", once],
    ] as const) {
      const id = spawn(game, aura);
      game.state.objects[id].attachedTo = on;
    }
    lands(game, "Island", 4);
    cast(game, toHand(game, "Baki's Curse"));
    expect(game.state.objects[once].damageMarked).toBe(2);
    expect(game.state.objects[none].damageMarked).toBe(0);
    // Toughness 4: two Auras, 4 damage, lethal, the same pass as the others'.
    expect(zone(game, twice)).toBe("graveyard");
  });
});

describe("except a target, with the spell's own slots kept (`as`)", () => {
  it("Public Execution: the target's controller, read after it's destroyed", () => {
    const { game } = table({ players: 4 });
    const target = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Serra Angel", B);
    const mine = spawn(game, "Serra Angel");
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Public Execution"), { targets: [ref(target)] });
    expect(zone(game, target)).toBe("graveyard");
    expect(pt(game, other).power).toBe(2);
    expect(pt(game, mine).power).toBe(4);
  });

  it("Exhilarating Elocution: counters on the target, +1/+1 on the rest of yours", () => {
    const { game } = table();
    const target = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Exhilarating Elocution"), { targets: [ref(target)] });
    expect(pt(game, target)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, other)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Polymorphist's Jest: each creature a target player controls", () => {
  it("makes theirs a blue 1/1 Frog with no abilities, and leaves yours", () => {
    const { game } = table();
    const theirs = spawn(game, "Serra Angel", B);
    const mine = spawn(game, "Serra Angel");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Polymorphist's Jest"), { targets: [ref(B)] });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    expect(subtypes(game, theirs)).toEqual(["Frog"]);
    expect(keywords(game, theirs).has("flying")).toBe(false);
    expect(pt(game, mine)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, mine).has("flying")).toBe(true);
  });
});

describe("Thundercloud Elemental and Aethersquall Ancient: all other creatures", () => {
  it("takes flying from the others until end of turn, and keeps its own", () => {
    const { game } = table();
    const elemental = spawn(game, "Thundercloud Elemental");
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 4);
    activate(game, elemental, 1);
    expect(keywords(game, angel).has("flying")).toBe(false);
    expect(keywords(game, elemental).has("flying")).toBe(true);
  });

  it("returns all others to their owners' hands in one event", () => {
    const { game } = table();
    const ancient = spawn(game, "Aethersquall Ancient");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Serra Angel", B);
    game.state.players[A].energy = 8;
    activate(game, ancient, 0);
    expect(zone(game, mine)).toBe("hand");
    expect(zone(game, theirs)).toBe("hand");
    expect(zone(game, ancient)).toBe("battlefield");
    expect(game.state.players[A].energy).toBe(0);
  });
});

describe("Nightcreep and Moonmist: two mass effects in one spell", () => {
  it("turns creatures black and lands into Swamps until end of turn", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    const land = spawn(game, "Forest", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Nightcreep"));
    expect(subtypes(game, land)).toEqual(["Swamp"]);
    expect(matchesFilter(game.state, registryOf(game), angel, { colors: ["B"] }, { you: A })).toBe(true);
    expect(types(game, angel)).toContain("creature");
  });

  it("transforms every Human that can, and a single-faced one does nothing (701.27c)", () => {
    const { game } = table();
    const werewolf = spawn(game, "Gatstaf Shepherd");
    const delver = spawn(game, "Delver of Secrets");
    const plain = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Moonmist"));
    expect(game.state.objects[werewolf].face).toBe(1);
    expect(game.state.objects[delver].face).toBe(1);
    expect(game.state.objects[plain].face ?? 0).toBe(0);
  });
});

describe("without `simultaneous`, permanents take turns", () => {
  const sacrificer = defineCard({
    name: "Test Each You May Sacrifice",
    manaCost: "{0}",
    colors: [],
    types: ["sorcery"],
    text: "For each creature you control, you may sacrifice it.",
    targets: [],
    effect: {
      kind: "for-each-permanent",
      filter: { type: "creature", controlledBy: "you" },
      effect: { kind: "may", prompt: "Sacrifice it?", effect: { kind: "sacrifice-target", target: 0 } },
    },
  });

  it("answers a choice for each before the next", () => {
    const seat = new ScriptedController(A);
    const game = Game.create({
      seed: 1,
      shuffle: false,
      rules: { skipFirstDraw: false, maxHandSize: 99, startingLife: 20 },
      controllers: { [A]: seat, [B]: new ScriptedController(B) },
      decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
      registry: createDefaultRegistry().register(sacrificer),
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    const one = game.debugSpawn("Grizzly Bears", A, "battlefield", { summoningSick: false });
    const two = game.debugSpawn("Grizzly Bears", A, "battlefield", { summoningSick: false });
    const bob = game.debugSpawn("Grizzly Bears", B, "battlefield", { summoningSick: false });
    // Yes to the first, no to the second: one answer per permanent, in turn.
    const answers: number[][] = [[0], []];
    let asked = 0;
    seat.chooseModesFn = () => {
      asked += 1;
      return answers.shift() ?? [];
    };
    cast(game, game.debugSpawn(sacrificer.name, A, "hand"));
    expect(asked).toBe(2);
    expect(zone(game, bob)).toBe("battlefield");
    expect([zone(game, one), zone(game, two)].sort()).toEqual(["battlefield", "graveyard"]);
  });

  it("skips a permanent that's gone by its turn (rule 400.7)", () => {
    const sweeper = defineCard({
      name: "Test Each Sweeps",
      manaCost: "{0}",
      colors: [],
      types: ["sorcery"],
      text: "For each creature, destroy all creatures, then you gain 1 life.",
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature" },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "destroy-all", filter: { type: "creature" } },
            { kind: "gain-life", amount: 1 },
          ],
        },
      },
    });
    const game = Game.create({
      seed: 1,
      shuffle: false,
      rules: { skipFirstDraw: false, maxHandSize: 99, startingLife: 20 },
      controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
      decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
      registry: createDefaultRegistry().register(sweeper),
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    game.debugSpawn("Grizzly Bears", A, "battlefield", { summoningSick: false });
    game.debugSpawn("Grizzly Bears", B, "battlefield", { summoningSick: false });
    game.debugSpawn("Serra Angel", B, "battlefield", { summoningSick: false });
    const before = life(game);
    cast(game, game.debugSpawn(sweeper.name, A, "hand"));
    expect(life(game)).toBe(before + 1);
  });
});
