/**
 * `would-add-counter` reading who puts them (`whoPuts`) and reaching players
 * (`onPlayers`), halving rounded down (`halved`): Vorinclex, Monstrous Raider,
 * Innkeeper's Talent, Lae'zel, Vlaakith's Champion. Rules 120.3b, 120.3g, 122.6,
 * 614.12, 616.1.
 */
import { describe, expect, it } from "vitest";
import { counterTotalInBestOrder } from "../replacements.js";
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
  loyalty,
  nextTurn,
  pickTargets,
  ref,
  spawn,
  table,
  toHand,
  toStep,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const growth = (game: Game, on: ObjectId, by: PlayerId = A): void => {
  lands(game, "Forest", 1, by);
  cast(game, toHand(game, "Battlegrowth", by), { player: by, targets: [ref(on)] });
};

const energy = (game: Game, player: PlayerId): number => game.state.players[player].energy;
const poison = (game: Game, player: PlayerId): number => game.state.players[player].counters.poison ?? 0;

describe("the best order (rule 616.1)", () => {
  const steps = (multipliers: number[], plus: number[], halved: number) => ({ multipliers, plus, halved });

  it("is the old sum with no halving", () => {
    expect(counterTotalInBestOrder("+1/+1", 1, steps([2], [1], 0))).toBe(4);
    expect(counterTotalInBestOrder("-1/-1", 2, steps([2], [-1, 1], 0))).toBe(3);
    expect(counterTotalInBestOrder("-1/-1", 1, steps([2], [-1], 0))).toBe(0);
  });

  it("halves after a doubling for what's wanted, before it for what isn't", () => {
    expect(counterTotalInBestOrder("+1/+1", 1, steps([2], [], 1))).toBe(1);
    expect(counterTotalInBestOrder("poison", 1, steps([2], [], 1))).toBe(0);
  });

  it("looks for the order: adding first or last, whichever is more", () => {
    expect(counterTotalInBestOrder("+1/+1", 1, steps([], [1], 1))).toBe(1); // (1+1)/2, not 0/2
    expect(counterTotalInBestOrder("+1/+1", 4, steps([], [1, 1], 1))).toBe(4); // 4/2 + 2, not (4+2)/2
  });

  it("stops once none would be put", () => {
    expect(counterTotalInBestOrder("+1/+1", 1, steps([], [], 1))).toBe(0);
    expect(counterTotalInBestOrder("-1/-1", 1, steps([], [1], 1))).toBe(0); // halved first: nothing to add to
  });
});

describe("Vorinclex, Monstrous Raider", () => {
  it("is what it says on the card", () => {
    const { game } = table();
    const vorinclex = spawn(game, "Vorinclex, Monstrous Raider");
    expect([...keywords(game, vorinclex)]).toEqual(expect.arrayContaining(["trample", "haste"]));
  });

  it("doubles what you put, on anyone's permanent", () => {
    const { game } = table();
    spawn(game, "Vorinclex, Monstrous Raider");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    growth(game, mine);
    growth(game, theirs);
    expect(counters(game, mine)).toBe(2);
    expect(counters(game, theirs)).toBe(2);
  });

  it("halves what an opponent puts, each kind rounded down, on anyone's permanent", () => {
    const { game } = table();
    spawn(game, "Vorinclex, Monstrous Raider");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    const three = spawn(game, "Grizzly Bears");
    nextTurn(game);
    lands(game, "Forest", 5, B);
    cast(game, toHand(game, "Incremental Growth", B), { player: B, targets: [ref(one), ref(two), ref(three)] });
    expect(counters(game, one)).toBe(0);
    expect(counters(game, two)).toBe(1);
    expect(counters(game, three)).toBe(1);
  });

  it("counters a permanent enters with are its controller's to put", () => {
    const { game } = table();
    spawn(game, "Vorinclex, Monstrous Raider");
    lands(game, "Wastes", 4);
    const mine = toHand(game, "Walking Ballista");
    cast(game, mine, { x: 2 });
    expect(counters(game, mine)).toBe(4);
    nextTurn(game);
    lands(game, "Wastes", 6, B);
    const theirs = toHand(game, "Walking Ballista", B);
    cast(game, theirs, { player: B, x: 3 });
    expect(counters(game, theirs)).toBe(1);
  });

  it("each player's own Vorinclex: a counter you put is doubled by yours and halved by theirs", () => {
    const { game } = table();
    spawn(game, "Vorinclex, Monstrous Raider");
    spawn(game, "Vorinclex, Monstrous Raider", B);
    const bears = spawn(game, "Grizzly Bears");
    growth(game, bears);
    expect(counters(game, bears)).toBe(1);
  });

  it("a planeswalker enters with twice or half its loyalty, and its costs' counters too", () => {
    const { game } = table();
    spawn(game, "Vorinclex, Monstrous Raider");
    lands(game, "Wastes", 3);
    lands(game, "Swamp", 2);
    const liliana = toHand(game, "Liliana Vess");
    cast(game, liliana);
    expect(counters(game, liliana, "loyalty")).toBe(10);
    loyalty(game, liliana, 1, { targets: [ref(B)] });
    expect(counters(game, liliana, "loyalty")).toBe(12);

    nextTurn(game);
    lands(game, "Wastes", 3, B);
    lands(game, "Swamp", 2, B);
    const theirs = toHand(game, "Liliana Vess", B);
    cast(game, theirs, { player: B });
    expect(counters(game, theirs, "loyalty")).toBe(2);
    // +1 rounds down to nothing, on an opponent's own cost.
    loyalty(game, theirs, 1, { player: B, targets: [ref(A)] });
    expect(counters(game, theirs, "loyalty")).toBe(2);
  });

  it("reaches players: your infect doubled, an opponent's halved to nothing", () => {
    const { game, a, b } = table();
    spawn(game, "Vorinclex, Monstrous Raider");
    const agent = spawn(game, "Blighted Agent"); // 1/1 infect, unblockable
    attack(game, a, [agent]);
    expect(poison(game, B)).toBe(2);
    nextTurn(game);
    const theirs = spawn(game, "Blighted Agent", B);
    attack(game, b, [theirs], A);
    expect(poison(game, A)).toBe(0);
  });

  it("reaches energy: yours doubled, an opponent's halved", () => {
    const { game } = table();
    spawn(game, "Vorinclex, Monstrous Raider");
    enter(game, "Aether Hub"); // "you get {E}"
    expect(energy(game, A)).toBe(2);
    nextTurn(game);
    enter(game, "Aether Hub", B);
    expect(energy(game, B)).toBe(0);
    enter(game, "Bristling Hydra", B); // {E}{E}{E}
    expect(energy(game, B)).toBe(1);
  });

  it("paying energy isn't putting it: one spent is one gone", () => {
    const { game } = table();
    spawn(game, "Vorinclex, Monstrous Raider");
    const hub = enter(game, "Aether Hub");
    expect(energy(game, A)).toBe(2);
    game.dispatch({ type: "activate-ability", player: A, source: hub, abilityIndex: 1, targets: [], manaColors: ["G"] });
    expect(energy(game, A)).toBe(1);
  });

  it("the affected player's best order: an opponent's single counter survives with their Hardened Scales", () => {
    const { game } = table();
    spawn(game, "Vorinclex, Monstrous Raider");
    const theirs = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hardened Scales", B);
    nextTurn(game);
    growth(game, theirs, B);
    expect(counters(game, theirs)).toBe(1);
  });

  it("does nothing once its abilities are gone", () => {
    const { game } = table();
    spawn(game, "Vorinclex, Monstrous Raider");
    spawn(game, "Humility");
    const bears = spawn(game, "Grizzly Bears");
    growth(game, bears);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Innkeeper's Talent", () => {
  const levelUp = (game: Game, talent: ObjectId, to: 2 | 3): void => {
    lands(game, "Forest", to === 2 ? 1 : 4);
    activate(game, talent, to === 2 ? 0 : 1);
  };

  /** Bob casts Shock with exactly {R}, no {1} left to pay a ward. */
  const shock = (game: Game, at: ObjectId): void => {
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(at)] });
  };
  const damaged = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

  it("level 1 puts a +1/+1 counter on a creature you control at combat", () => {
    const { game, a } = table();
    spawn(game, "Innkeeper's Talent");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    game.advanceUntil((s) => s.pendingTriggers.length === 0 && s.zones.shared.stack.length === 0);
    expect(counters(game, bears)).toBe(1);
  });

  it("level 1 has no ward: a Shock at a creature with a counter resolves", () => {
    const { game } = table();
    spawn(game, "Innkeeper's Talent");
    const bears = spawn(game, "Grizzly Bears");
    growth(game, bears);
    nextTurn(game);
    shock(game, bears);
    expect(damaged(game, bears)).toBe(2);
  });

  it("level 2: ward {1} on a permanent with a counter, not on one without", () => {
    const { game, a } = table();
    const talent = spawn(game, "Innkeeper's Talent");
    const countered = spawn(game, "Grizzly Bears");
    const bare = spawn(game, "Grizzly Bears");
    growth(game, countered);
    levelUp(game, talent, 2);
    pickTargets(a, countered); // level 1's own trigger, on the way to Bob's turn
    nextTurn(game);
    shock(game, bare);
    expect(game.state.objects[bare].zone).toBe("graveyard");
    shock(game, countered);
    expect(damaged(game, countered)).toBe(0);
    expect(graveyard(game, B).filter((id) => game.state.objects[id].cardName === "Shock").length).toBe(2);
  });

  it("doubles nothing until level 3", () => {
    const { game } = table();
    const talent = spawn(game, "Innkeeper's Talent");
    const bears = spawn(game, "Grizzly Bears");
    levelUp(game, talent, 2);
    growth(game, bears);
    expect(counters(game, bears)).toBe(1);
  });

  it("level 3 doubles what you put on a permanent or player, not what an opponent puts", () => {
    const { game, a } = table();
    const talent = spawn(game, "Innkeeper's Talent");
    const bears = spawn(game, "Grizzly Bears");
    const fresh = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    levelUp(game, talent, 2);
    levelUp(game, talent, 3);
    growth(game, bears);
    growth(game, theirs);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, theirs)).toBe(2);

    enter(game, "Aether Hub");
    expect(energy(game, A)).toBe(2);

    const agent = spawn(game, "Blighted Agent");
    pickTargets(a, agent); // its own trigger, at the beginning of combat
    attack(game, a, [agent]);
    expect(counters(game, agent)).toBe(2);
    expect(poison(game, B)).toBe(6); // the Agent is a 3/3 with those two: 3 poison, doubled

    nextTurn(game);
    growth(game, fresh, B);
    expect(counters(game, fresh)).toBe(1);
  });
});

describe("Lae'zel, Vlaakith's Champion", () => {
  it("adds one to what you put on your creature or planeswalker", () => {
    const { game } = table();
    spawn(game, "Lae'zel, Vlaakith's Champion");
    const bears = spawn(game, "Grizzly Bears");
    growth(game, bears);
    expect(counters(game, bears)).toBe(2);
    lands(game, "Wastes", 3);
    lands(game, "Swamp", 2);
    const liliana = toHand(game, "Liliana Vess");
    cast(game, liliana);
    expect(counters(game, liliana, "loyalty")).toBe(6);
  });

  it("not on an opponent's creature, nor your noncreature artifact", () => {
    const { game, a } = table();
    spawn(game, "Lae'zel, Vlaakith's Champion");
    spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    growth(game, theirs);
    expect(counters(game, theirs)).toBe(1);
    lands(game, "Wastes", 5);
    a.chooseCreatureTypeFn = () => "Bear";
    const banner = toHand(game, "Banner of Kinship");
    cast(game, banner);
    expect(counters(game, banner, "fellowship")).toBe(1);
  });

  it("not what an opponent puts on your creature", () => {
    const { game } = table();
    spawn(game, "Lae'zel, Vlaakith's Champion");
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game);
    growth(game, bears, B);
    expect(counters(game, bears)).toBe(1);
  });

  it("on yourself, not on another player", () => {
    const { game, a } = table();
    spawn(game, "Lae'zel, Vlaakith's Champion");
    enter(game, "Aether Hub");
    expect(energy(game, A)).toBe(2);
    const agent = spawn(game, "Blighted Agent");
    attack(game, a, [agent]);
    expect(poison(game, B)).toBe(1);
  });

  it("is a commander that chooses a Background", () => {
    const { game } = table();
    const laezel = spawn(game, "Lae'zel, Vlaakith's Champion");
    expect(game.registry.get(game.state.objects[laezel].cardName).pairing).toEqual({ kind: "choose-a-background" });
  });
});
