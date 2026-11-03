/**
 * Countering abilities on the stack (rule 701.6): one target (`counter` on a
 * `stack` or `ability` slot), what happens to the ability's source
 * (`thenSource`), and every ability or spell matching (`for-each-on-stack`).
 */
import { describe, expect, it } from "vitest";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { isLegalTarget } from "../targeting.js";
import type { TargetSpec } from "../target.js";
import {
  A,
  activate,
  B,
  C,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const canTarget = (game: Game, object: ObjectId, spec: TargetSpec, player: PlayerId): boolean =>
  isLegalTarget(game.state, game.registry, spec, { kind: "object", object }, player);

/** Alice's Rod of Ruin aimed at Bob, its ability left on the stack. */
const rodAtBob = (game: Game): { rod: ObjectId; ability: ObjectId } => {
  lands(game, "Wastes", 3);
  const rod = spawn(game, "Rod of Ruin");
  activate(game, rod, 0, { targets: [ref(B)], settle: false });
  return { rod, ability: game.state.zones.shared.stack[0] };
};
const pyromancerAtBob = (game: Game): { pyro: ObjectId; ability: ObjectId } => {
  const pyro = spawn(game, "Prodigal Pyromancer");
  activate(game, pyro, 0, { targets: [ref(B)], settle: false });
  return { pyro, ability: game.state.zones.shared.stack[game.state.zones.shared.stack.length - 1] };
};
const castAtStack = (game: Game, seat: ScriptedController, card: ObjectId, player: PlayerId, target?: ObjectId): void => {
  seat.enqueue({
    type: "cast-spell",
    player,
    card,
    targets: target === undefined ? [] : [{ kind: "object", object: target }],
  });
  settle(game);
};

describe("Disallow: a spell, an activated ability or a triggered ability", () => {
  it("counters an activated ability", () => {
    const { game, b } = table();
    lands(game, "Island", 3, B);
    const { ability } = rodAtBob(game);
    castAtStack(game, b, toHand(game, "Disallow", B), B, ability);
    expect(life(game, B)).toBe(20);
  });

  it("counters a triggered ability", () => {
    const { game, b } = table();
    lands(game, "Island", 3, B);
    const disallow = toHand(game, "Disallow", B);
    spawn(game, "Soul Warden");
    enter(game, "Grizzly Bears", B, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    const trigger = game.state.zones.shared.stack[0];
    expect(game.state.objects[trigger].kind).toBe("ability");
    castAtStack(game, b, disallow, B, trigger);
    expect(life(game, A)).toBe(20);
  });

  it("counters a spell", () => {
    const { game, b } = table();
    lands(game, "Island", 3, B);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    castAtStack(game, b, toHand(game, "Disallow", B), B, bolt);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Green Slime: the source of the countered ability is destroyed", () => {
  it("destroys the artifact whose ability it countered", () => {
    const { game, b } = table();
    const { rod } = rodAtBob(game);
    const ability = game.state.zones.shared.stack[0];
    pickTargets(b, ability);
    enter(game, "Green Slime", B);
    expect(life(game, B)).toBe(20);
    expect(zone(game, rod)).toBe("graveyard");
  });

  it("can't reach an ability from a creature", () => {
    const { game } = table();
    const { ability } = pyromancerAtBob(game);
    const spec: TargetSpec = { kind: "ability", sourceTypes: ["artifact", "enchantment"] };
    expect(canTarget(game, ability, spec, B)).toBe(false);
  });

  it("destroys nothing when the source has already left", () => {
    const { game, b } = table();
    const { rod, ability } = rodAtBob(game);
    // Gone and back: a new object, not the one that activated it (rule 400.7).
    game.debugApplyEffect(B, { kind: "flicker", target: 0 }, [ref(rod)]);
    pickTargets(b, ability);
    enter(game, "Green Slime", B);
    expect(life(game, B)).toBe(20);
    expect(zone(game, rod)).toBe("battlefield");
  });
});

describe("Ouphe Vandals: counters and destroys the artifact", () => {
  it("does both, with the sacrifice paid", () => {
    const { game, b } = table();
    lands(game, "Forest", 1, B);
    const vandals = spawn(game, "Ouphe Vandals", B);
    const { rod, ability } = rodAtBob(game);
    b.enqueue({ type: "activate-ability", player: B, source: vandals, abilityIndex: 0, targets: [ref(ability)] });
    settle(game);
    expect(zone(game, vandals)).toBe("graveyard");
    expect(zone(game, rod)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Nimble Obstructionist: an ability you don't control", () => {
  it("counters another player's as you cycle it, never your own", () => {
    const { game, b } = table();
    lands(game, "Island", 3, B);
    const { ability } = rodAtBob(game);
    const spec: TargetSpec = { kind: "ability", whose: "opponent" };
    expect(canTarget(game, ability, spec, A)).toBe(false);
    expect(canTarget(game, ability, spec, B)).toBe(true);
    const card = toHand(game, "Nimble Obstructionist", B);
    pickTargets(b, ability);
    b.enqueue({ type: "cycle", player: B, card });
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Tishana's Tidebinder: the source loses its abilities while it stays", () => {
  it("strips a creature's abilities until it leaves", () => {
    const { game, b } = table();
    const { pyro, ability } = pyromancerAtBob(game);
    pickTargets(b, ability);
    const binder = enter(game, "Tishana's Tidebinder", B);
    expect(life(game, B)).toBe(20);
    game.state.objects[pyro].tapped = false;
    const offers = (): number =>
      game.legalActions(A).filter((a) => a.kind === "activate-ability" && a.source === pyro).length;
    expect(offers()).toBe(0);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(binder)]);
    settle(game);
    expect(zone(game, binder)).toBe("graveyard");
    expect(offers()).toBeGreaterThan(0);
  });

  it("leaves an enchantment its abilities, though its ability is countered", () => {
    const { game, b } = table();
    const bombardment = spawn(game, "Goblin Bombardment");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Runeclaw Bear");
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: bombardment,
      abilityIndex: 0,
      targets: [ref(B)],
      sacrifice: bears,
    });
    pickTargets(b, game.state.zones.shared.stack[0]);
    enter(game, "Tishana's Tidebinder", B);
    expect(life(game, B)).toBe(20);
    expect(
      game.legalActions(A).filter((a) => a.kind === "activate-ability" && a.source === bombardment).length,
    ).toBeGreaterThan(0);
  });

  it("is offered at instant speed with an ability on the stack", () => {
    const { game } = table();
    lands(game, "Island", 3, B);
    const binder = toHand(game, "Tishana's Tidebinder", B);
    pyromancerAtBob(game);
    game.dispatch({ type: "pass-priority", player: A });
    game.advanceUntil((s) => s.priority.holder === B);
    expect(game.state.zones.shared.stack).toHaveLength(1);
    expect(game.legalActions(B).some((a) => a.kind === "cast-spell" && a.card === binder)).toBe(true);
  });

  it("cast in response, its enters trigger counters the ability below it", () => {
    const { game, b } = table();
    lands(game, "Island", 3, B);
    const binder = toHand(game, "Tishana's Tidebinder", B);
    const { pyro, ability } = pyromancerAtBob(game);
    pickTargets(b, ability);
    castAtStack(game, b, binder, B);
    expect(zone(game, binder)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
    game.state.objects[pyro].tapped = false;
    expect(game.legalActions(A).filter((a) => a.kind === "activate-ability" && a.source === pyro)).toHaveLength(0);
  });

  it("may be cast with nothing to counter", () => {
    const { game } = table();
    const binder = enter(game, "Tishana's Tidebinder", B);
    expect(zone(game, binder)).toBe("battlefield");
    expect(keywords(game, binder).has("flash")).toBe(true);
  });
});

describe("Teferi's Response: a spell or ability aimed at your land", () => {
  const spec: TargetSpec = {
    kind: "stack",
    spells: "any",
    abilities: true,
    whose: "opponent",
    targeting: { permanent: { type: "land", controlledBy: "you" } },
  };

  it("counters an ability aimed at your land, destroys its source and draws two", () => {
    const { game, b } = table();
    lands(game, "Wastes", 3);
    lands(game, "Island", 2, B);
    const land = spawn(game, "Forest", B);
    const icy = spawn(game, "Icy Manipulator");
    activate(game, icy, 0, { targets: [ref(land)], settle: false });
    const ability = game.state.zones.shared.stack[0];
    const before = hand(game, B).length;
    const response = toHand(game, "Teferi's Response", B);
    castAtStack(game, b, response, B, ability);
    expect(zone(game, icy)).toBe("graveyard");
    expect(game.state.objects[land].tapped ?? false).toBe(false);
    expect(hand(game, B).length).toBe(before + 2);
    expect(graveyard(game, B)).toContain(response);
  });

  it("counters a spell aimed at your land and destroys nothing", () => {
    const { game, b } = table();
    lands(game, "Mountain", 3);
    lands(game, "Island", 2, B);
    const land = spawn(game, "Forest", B);
    const stone = toHand(game, "Stone Rain");
    cast(game, stone, { targets: [ref(land)], settle: false });
    castAtStack(game, b, toHand(game, "Teferi's Response", B), B, stone);
    expect(zone(game, stone)).toBe("graveyard");
    expect(zone(game, land)).toBe("battlefield");
  });

  it("reaches neither what aims elsewhere nor your own", () => {
    const { game } = table({ players: 3 });
    lands(game, "Wastes", 3);
    const theirLand = spawn(game, "Forest", C);
    const icy = spawn(game, "Icy Manipulator");
    activate(game, icy, 0, { targets: [ref(theirLand)], settle: false });
    const ability = game.state.zones.shared.stack[0];
    // Aimed at Carol's land: Carol's to answer, not Bob's, and not Alice's own.
    expect(canTarget(game, ability, spec, B)).toBe(false);
    expect(canTarget(game, ability, spec, C)).toBe(true);
    expect(canTarget(game, ability, spec, A)).toBe(false);
  });
});

describe("Kadena's Silencer: every ability your opponents control", () => {
  it("counters theirs and leaves yours, as it turns face up", () => {
    const { game, b } = table();
    lands(game, "Island", 2, B);
    const silencer = spawn(game, "Kadena's Silencer", B);
    game.state.objects[silencer].faceDown = { kind: "morph" };
    rodAtBob(game);
    b.enqueue({ type: "turn-face-up", player: B, permanent: silencer, morph: true });
    settle(game);
    expect(game.state.objects[silencer].faceDown).toBeUndefined();
    expect(zone(game, silencer)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });

  it("leaves its controller's own ability alone", () => {
    const { game, b } = table();
    lands(game, "Island", 2, B);
    lands(game, "Wastes", 1, B);
    const silencer = spawn(game, "Kadena's Silencer", B);
    game.state.objects[silencer].faceDown = { kind: "morph" };
    const mine = spawn(game, "Prodigal Pyromancer", B);
    pyromancerAtBob(game);
    b.enqueue(
      { type: "activate-ability", player: B, source: mine, abilityIndex: 0, targets: [ref(A)] },
      { type: "turn-face-up", player: B, permanent: silencer, morph: true },
    );
    settle(game);
    // Alice's ping at Bob is countered; Bob's at Alice resolves.
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(19);
  });
});

describe("Summary Dismissal: all other spells exiled, all abilities countered", () => {
  it("exiles the spells, a counterspell or no, counters the abilities, and resolves itself", () => {
    const { game, b } = table();
    lands(game, "Island", 4, B);
    lands(game, "Mountain", 1);
    pyromancerAtBob(game);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    const dismissal = toHand(game, "Summary Dismissal", B);
    castAtStack(game, b, dismissal, B);
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game, B)).toBe(20);
    expect(zone(game, dismissal)).toBe("graveyard");
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });
});
